# Sustainability estimates (what we can and can’t say — yet)

**TL;DR:** For consumer chat, there are *not* reputable, vendor-published numbers for **kWh / CO2e / water per message** for GPT‑5 mini, Claude Sonnet 4.5, or Gemini 2.5 Flash.

So on this site we separate:

1) **Disclosed (best):** official, vendor-published energy/CO2e/water for a specific model SKU.
2) **Measurable (good):** you can measure device power directly (mostly for local models) + apply grid intensity.
3) **Estimated (ok, but caveated):** use standard tools/methods to estimate emissions from hardware runtime + regional grid intensity.
4) **Proxy (weak):** transparency grades, provider commitments, and efficiency benchmarks that don’t allocate impact to a specific model.

## What the vendors disclose today
### OpenAI (GPT‑5 mini)
- No model-level disclosure found for training energy, training CO2e, inference energy/CO2e per request/token, or water.
- Stanford CRFM’s Foundation Model Transparency Index notes OpenAI withholds key training details even for GPT‑4 (e.g., compute/hardware), which makes footprint estimation difficult.
  - Source: https://crfm.stanford.edu/fmti/May-2024/company-reports/OpenAI_GPT-4.html

### Anthropic (Claude Sonnet 4.5)
- No model-level disclosure found for training energy/CO2e, inference energy/CO2e per request/token, or water.
- Stanford CRFM’s report for Claude 3 marks energy/carbon fields as not disclosed.
  - Source: https://crfm.stanford.edu/fmti/May-2024/company-reports/Anthropic_Claude%203.html

### Google (Gemini 2.5 Flash)
- No model-level disclosure found for training energy/CO2e, inference energy/CO2e per request/token, or water.
- Google does publish extensive company-level sustainability reporting (useful, but not allocatable to a specific model interaction).
  - Source hub: https://sustainability.google/stories/

## Reputable ways to estimate (with caveats)
These do **not** give you an official “CO2e per message”, but they are the most reputable starting points.

- **CodeCarbon** (measure/estimate emissions from compute)
  - https://github.com/mlco2/codecarbon
- **Green Algorithms** (method + calculator for computational footprints)
  - https://www.green-algorithms.org/
- **Academic reference:** *Strubell et al. (2019) — “Energy and Policy Considerations for Deep Learning in NLP”* (classic paper on training impacts)
  - https://arxiv.org/abs/1910.09700

## Efficiency benchmarks (systems-level)
Benchmarks can compare **performance per watt**, but typically benchmark *systems/implementations* rather than attributing a footprint to a specific consumer chat model.

- **MLCommons / MLPerf Inference (Datacenter)**
  - https://mlcommons.org/benchmarks/inference-datacenter/

## How we present this on the site
- We label sustainability as **transparency + confidence** unless a vendor discloses model-level footprints.
- We link sources for every claim.
- We avoid fake precision.

If you have a strong source that provides model-specific CO2e/kWh/water for one of these SKUs, please open an issue in the repo with the link.
