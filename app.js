async function loadModels(){
  const res = await fetch('./data/models.json', {cache:'no-store'});
  if(!res.ok) throw new Error('Failed to load models.json');
  return await res.json();
}

function clamp(n,min,max){return Math.max(min, Math.min(max,n));}

// Scoring for v0: weighted to things we can cite. UX/performance excluded by request.
const WEIGHTS = {
  affordability: 40,
  privacy: 40,
  sustainability: 20,
};

function getMode(){
  const el = document.querySelector('input[name="mode"]:checked');
  return el ? el.value : 'consumer';
}

function privacyBlock(model, mode){
  // mode: consumer | api
  const p = model.privacy || {};
  return mode === 'api' ? p.api_enterprise : p.consumer;
}

function affordabilityScore(pricing){
  // Blended cost for a typical chat turn.
  // Assumption: 1K input + 500 output tokens.
  const mtokIn = 0.001;
  const mtokOut = 0.0005;
  const cost = pricing.input_per_mtok_usd*mtokIn + pricing.output_per_mtok_usd*mtokOut;
  return {cost};
}

function confidenceToScore(conf){
  if(conf === 'high') return 1.0;
  if(conf === 'medium') return 0.65;
  return 0.35;
}

function privacyScore(block){
  if(!block) return 0;
  const srcCount = (block.sources || []).length;
  const base = 0.4 + Math.min(srcCount,3)*0.15; // 0.55..0.85
  const conf = confidenceToScore(block.confidence);
  return clamp(base*conf, 0, 1);
}

function sustainabilityScore(sus){
  if(!sus) return 0;
  const srcCount = (sus.sources || []).length;
  const base = 0.35 + Math.min(srcCount,2)*0.2; // 0.55..0.75
  const conf = confidenceToScore(sus.confidence);
  return clamp(base*conf, 0, 1);
}

function pillForConfidence(conf){
  if(conf==='high') return `<span class="pill good">High confidence</span>`;
  if(conf==='medium') return `<span class="pill warn">Medium confidence</span>`;
  return `<span class="pill bad">Low confidence</span>`;
}

function fmtMoney(x){return '$' + x.toFixed(4);}
function fmtPriceMTok(x){return '$' + x.toFixed(2) + ' / MTok';}

function renderSources(urls){
  if(!urls || !urls.length) return '<span class="small">No sources yet.</span>';
  return '<ul class="small">' + urls.map(u=>`<li><a href="${u}" target="_blank" rel="noopener">${u}</a></li>`).join('') + '</ul>';
}

function overallScore(model, cheapestCost, mode){
  const aff = affordabilityScore(model.pricing);
  const affRel = clamp(cheapestCost / aff.cost, 0, 1);
  const privBlock = privacyBlock(model, mode);
  const priv = privacyScore(privBlock);
  const sus = sustainabilityScore(model.sustainability);
  const total = (affRel*WEIGHTS.affordability + priv*WEIGHTS.privacy + sus*WEIGHTS.sustainability);
  return {total, affCost: aff.cost, affRel, priv, sus, privBlock};
}

function renderCard(model, score){
  const priv = score.privBlock;
  return `
  <div class="card">
    <div class="row">
      <div>
        <div class="modelName">${model.displayName}</div>
        <div class="small">Chat surface: <span class="code">${model.chatSurface}</span></div>
        ${model.openrouter?.id ? `<div class="small">OpenRouter id: <span class="code">${model.openrouter.id}</span></div>` : ''}
      </div>
      <div class="score">${Math.round(score.total)}</div>
    </div>

    <div class="row">
      <span class="badge">Affordability proxy</span>
      <span class="small">Typical turn cost: <span class="code">${fmtMoney(score.affCost)}</span></span>
    </div>

    <hr/>

    <div class="small"><b>Privacy & data controls</b> ${pillForConfidence(priv?.confidence || 'low')}</div>
    <div class="small">${priv?.notes || ''}</div>

    <div class="small"><b>Sustainability transparency</b> ${pillForConfidence(model.sustainability.confidence)}</div>
    <div class="small">${model.sustainability.notes || ''}</div>

    <details>
      <summary class="small">Sources</summary>
      <div class="small"><b>Pricing</b>: <a href="${model.pricing.source}" target="_blank" rel="noopener">${model.pricing.source}</a></div>
      <div class="small" style="margin-top:6px"><b>Privacy</b>:</div>
      ${renderSources(priv?.sources)}
      <div class="small" style="margin-top:6px"><b>Sustainability</b>:</div>
      ${renderSources(model.sustainability.sources)}
      ${model.openrouter?.source ? `<div class="small" style="margin-top:6px"><b>OpenRouter metadata</b>: <a href="${model.openrouter.source}" target="_blank" rel="noopener">${model.openrouter.source}</a></div>` : ''}
    </details>
  </div>`;
}

function renderTable(models, scores){
  const rows = models.map(m=>{
    const s = scores[m.key];
    const priv = s.privBlock;
    return `<tr>
      <td><b>${m.displayName}</b><div class="small">${m.provider}</div></td>
      <td>
        <div class="small">Input: <span class="code">${fmtPriceMTok(m.pricing.input_per_mtok_usd)}</span></div>
        <div class="small">Output: <span class="code">${fmtPriceMTok(m.pricing.output_per_mtok_usd)}</span></div>
        <div class="small">Source: <a href="${m.pricing.source}" target="_blank" rel="noopener">link</a></div>
      </td>
      <td>
        ${pillForConfidence(priv?.confidence || 'low')}
        <div class="small">${priv?.notes || ''}</div>
      </td>
      <td>
        ${pillForConfidence(m.sustainability.confidence)}
        <div class="small">${m.sustainability.notes || ''}</div>
      </td>
      <td class="score">${Math.round(s.total)}</td>
    </tr>`;
  }).join('');

  return `
  <table class="table">
    <thead>
      <tr>
        <th>Model</th>
        <th>Affordability</th>
        <th>Privacy</th>
        <th>Sustainability</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

async function render(){
  const rootCards = document.querySelector('#cards');
  const rootTable = document.querySelector('#table');

  const data = await loadModels();
  const models = data.models;
  const mode = getMode();

  const costs = models.map(m=>affordabilityScore(m.pricing).cost);
  const cheapest = Math.min(...costs);

  const scores = {};
  for(const m of models){
    scores[m.key] = overallScore(m, cheapest, mode);
  }

  const sorted = [...models].sort((a,b)=>scores[b.key].total - scores[a.key].total);
  rootCards.innerHTML = sorted.map(m=>renderCard(m, scores[m.key])).join('');
  rootTable.innerHTML = renderTable(sorted, scores);

  document.querySelector('#generatedAt').textContent = data.generatedAt;
  document.querySelector('#syncedAt').textContent = data.openrouterSyncedAt || '—';
}

async function main(){
  document.querySelectorAll('input[name="mode"]').forEach(el=>{
    el.addEventListener('change', ()=>render());
  });
  await render();
}

main().catch(err=>{
  console.error(err);
  document.querySelector('#cards').innerHTML = `<div class="panel">Error loading data: ${err.message}</div>`;
});
