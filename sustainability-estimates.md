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
Benchmarks can compare **performance per watt** (or **joules per token**), but typically benchmark *systems/implementations* or *open-weight models you can run*, rather than attributing a footprint to a specific consumer chat model behind a closed API.

- **MLCommons / MLPerf Inference (Datacenter)**
  - https://mlcommons.org/benchmarks/inference-datacenter/

- **TokenPowerBench (AAAI’26; arXiv:2512.03024)** — inference-focused benchmark that measures power without specialised external meters, aligns energy to **prefill vs decode**, and reports metrics like **joules per generated token**.
  - Paper: https://arxiv.org/abs/2512.03024v1
  - They report evaluations across widely used open(-ish) model series including **Llama**, **Qwen**, **Mistral**, and **Falcon**, covering scales from ~1B parameters up to **Llama3‑405B**.
  - Note: this is an example of the kind of tooling needed; it does *not* currently provide an official rating for closed consumer models like GPT‑5 mini / Sonnet 4.5 / Gemini 2.5 Flash.

- **From Prompts to Power (arXiv:2511.05597)** — large-scale, measurement-based study of **prompt-level inference energy** using the vLLM inference engine, spanning **32,500+ measurements**, **21 GPU configurations**, and **155 model architectures**.
  - Paper: https://arxiv.org/html/2511.05597
  - They report covering models up to very large open(-weight) systems including **Llama 3.1 405B** and **DeepSeek V3/R1 (685B)**.
  - They also describe a **predictive model** for inference energy and a **browser extension** that estimates energy usage for online services (e.g., ChatGPT/Gemini/DeepSeek) — useful for awareness, but still an estimate rather than vendor disclosure.

## Chat model use vs FIFO flights per year (rough equivalence)
This is a *back-of-envelope* comparison to make the scale intuitive. It is **not** a precise accounting.

### Assumptions
You can swap these numbers if you have better ones for your context.

**A) A “typical chat turn”**
- 1 turn = 1 user message + 1 assistant reply
- Assumed tokens per turn: **1,500 tokens** (very rough; short chats are less, long drafting is more)

**B) Emissions intensity of consumer chat**
- Vendors generally **do not publish** CO2e per 1K tokens for consumer chat.
- For illustration we show a wide range: **0.5–10 g CO2e per 1K tokens**.

**C) Flight benchmark (FIFO)**
- Return flight **Perth ↔ Newman**: assumed **0.4–0.6 t CO2e** (400–600 kg).
  - Note: this depends on aircraft type, load factor, whether you apply radiative forcing, and the calculator/method used.

### What this means in practice
Below are “equivalent flights per year” for three usage levels.

We compute:
- tokens/day = turns/day × 1,500
- CO2e/day = (tokens/day / 1,000) × (g CO2e per 1K tokens)
- CO2e/year = CO2e/day × 365
- flights/year = CO2e/year ÷ (0.4–0.6 t CO2e)

#### Light use (~30 turns/day)
- Tokens/day: ~45,000
- CO2e/year (illustrative):
  - **~8 kg** (at 0.5 g/1K)
  - **~164 kg** (at 10 g/1K)
- Flights/year equivalent (Perth↔Newman return):
  - **~0.01–0.02 flights/year** (low intensity)
  - **~0.27–0.41 flights/year** (high intensity)

#### Typical use (~100 turns/day)
- Tokens/day: ~150,000
- CO2e/year (illustrative):
  - **~27 kg** (at 0.5 g/1K)
  - **~548 kg** (at 10 g/1K)
- Flights/year equivalent:
  - **~0.05–0.07 flights/year** (low intensity)
  - **~0.9–1.4 flights/year** (high intensity)

#### Heavy use (~300 turns/day)
- Tokens/day: ~450,000
- CO2e/year (illustrative):
  - **~82 kg** (at 0.5 g/1K)
  - **~1,643 kg** (at 10 g/1K)
- Flights/year equivalent:
  - **~0.14–0.21 flights/year** (low intensity)
  - **~2.7–4.1 flights/year** (high intensity)

### Caveats (why this is so uncertain)
- The **big unknown** is CO2e per 1K tokens for *consumer chat*, because you can’t see the data center region, hardware, utilisation, and offsets.
- Token counts vary a lot with attachments, long context, image/audio, and “thinking” modes.
- Flight emissions vary by method; this comparison is for intuition, not accounting.

If you have a source that provides model-specific CO2e/kWh/water or a better flight factor, please open an issue in the repo with the link.

## How we present this on the site
- We label sustainability as **transparency + confidence** unless a vendor discloses model-level footprints.
- We link sources for every claim.
- We avoid fake precision.
