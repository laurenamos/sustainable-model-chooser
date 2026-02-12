#!/usr/bin/env python3
"""Sync selected model metadata (pricing, context length, moderation flag) from OpenRouter.

Usage:
  python3 scripts/sync_openrouter.py

Edits:
  - data/models.json

Notes:
- OpenRouter pricing fields are per-token USD strings (e.g. 0.00000025 == $0.25/MTok).
- This script only updates the fields under `openrouter` for each model.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
import requests

BASE = Path(__file__).resolve().parents[1]
DATA_PATH = BASE / "data" / "models.json"
OR_MODELS_URL = "https://openrouter.ai/api/v1/models"

@dataclass
class ORModel:
    id: str
    name: str
    context_length: int | None
    pricing: dict
    is_moderated: bool | None


def mtok(x: str | float | int | None) -> float | None:
    if x is None:
        return None
    try:
        return float(x) * 1_000_000
    except Exception:
        return None


def main():
    data = json.loads(DATA_PATH.read_text())

    resp = requests.get(OR_MODELS_URL, timeout=30)
    resp.raise_for_status()
    models = resp.json()["data"]
    index: dict[str, ORModel] = {}

    for m in models:
        index[m["id"]] = ORModel(
            id=m["id"],
            name=m.get("name", ""),
            context_length=m.get("context_length"),
            pricing=m.get("pricing", {}) or {},
            is_moderated=(m.get("top_provider") or {}).get("is_moderated"),
        )

    updated = 0
    for entry in data["models"]:
        or_id = (entry.get("openrouter") or {}).get("id")
        if not or_id:
            continue
        if or_id not in index:
            (entry.setdefault("openrouter", {}))["sync_error"] = f"OpenRouter id not found: {or_id}"
            continue

        m = index[or_id]
        entry.setdefault("openrouter", {})
        entry["openrouter"].update({
            "name": m.name,
            "context_length": m.context_length,
            "is_moderated": m.is_moderated,
            "pricing_per_token_usd": {
                k: float(v) for k, v in m.pricing.items() if _is_number(v)
            },
            "pricing_per_mtok_usd": {
                k: mtok(v) for k, v in m.pricing.items() if _is_number(v)
            },
            "source": OR_MODELS_URL,
            "syncedAt": datetime.now(timezone.utc).isoformat(),
        })
        entry["openrouter"].pop("sync_error", None)
        updated += 1

    data["openrouterSyncedAt"] = datetime.now(timezone.utc).isoformat()
    DATA_PATH.write_text(json.dumps(data, indent=2, sort_keys=False) + "\n")

    print(f"Updated {updated} model(s) in {DATA_PATH}")


def _is_number(v) -> bool:
    try:
        float(v)
        return True
    except Exception:
        return False


if __name__ == "__main__":
    main()
