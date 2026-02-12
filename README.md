# Sustainable Model Chooser (v0)

Static website prototype for comparing chat models with a holistic score.

## Run locally

```bash
cd sustainable-model-chooser
python3 -m http.server 8000
```

Open: http://localhost:8000

## What this is
- A *consumer-facing* comparison page (non-coding users)
- Transparent scoring rubric
- Citations per field
- Clearly labels unknowns / proxies (especially sustainability)

## Data sources
- Pricing + context length for many models can be pulled from OpenRouter's public `/api/v1/models` endpoint.
- Vendor policy pages (privacy/data retention) are linked as citations.

## Notes
This is an MVP: UX/performance testing and "true" carbon-per-message are out of scope for v0.
