import asyncio
import json
from pathlib import Path

import httpx
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from app.core.database import async_session_factory
from app.core.warframe_family import family_key_for, split_variant, stored_variant
from app.models import Cosmetic, WarframeVariant

DATA_FILE = Path(__file__).parent / "data" / "cosmetics.json"
WARFRAMES_URL = "https://api.warframestat.us/warframes"


async def fetch_unique_names() -> dict[str, str]:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(WARFRAMES_URL)
        response.raise_for_status()
        warframes = response.json()

    return {
        warframe["name"]: warframe["uniqueName"]
        for warframe in warframes
        if warframe.get("name") and warframe.get("uniqueName")
    }


def load_rows() -> list[dict]:
    rows = json.loads(DATA_FILE.read_text(encoding="utf-8"))

    unique: dict[tuple[str, str, str], dict] = {}
    for row in rows:
        key = (row["warframe"], row["kind"], row["name"])
        unique[key] = row

    if len(unique) != len(rows):
        print(f"Duplicados descartados: {len(rows) - len(unique)}")

    return list(unique.values())


def build_variant_rows(rows: list[dict], unique_names: dict[str, str]) -> list[dict]:
    variants: dict[str, dict] = {}
    for row in rows:
        name = row["warframe"]
        if name in variants:
            continue
        base, variant = split_variant(name)
        variants[name] = {
            "family_key": family_key_for(base),
            "variant": variant,
            "name": name,
            "unique_name": unique_names.get(name),
        }
    return list(variants.values())


def build_cosmetic_rows(rows: list[dict]) -> list[dict]:
    deduped: dict[tuple[str, str, str], dict] = {}
    for row in rows:
        base, variant = split_variant(row["warframe"])
        family_key = family_key_for(base)
        key = (family_key, row["kind"], row["name"])
        entry = deduped.get(key)
        if entry is None:
            entry = {
                "family_key": family_key,
                "kind": row["kind"],
                "name": row["name"],
                "image_local": row.get("image_local"),
                "image_cdn": row.get("image_cdn"),
                "description": row.get("description") or "",
                "variants": set(),
            }
            deduped[key] = entry
        else:
            entry["image_local"] = entry["image_local"] or row.get("image_local")
            entry["image_cdn"] = entry["image_cdn"] or row.get("image_cdn")
            entry["description"] = entry["description"] or (row.get("description") or "")
        entry["variants"].add(variant)

    result = []
    for entry in deduped.values():
        result.append(
            {
                "family_key": entry["family_key"],
                "variant": stored_variant(entry["variants"]),
                "kind": entry["kind"],
                "name": entry["name"],
                "image_local": entry["image_local"],
                "image_cdn": entry["image_cdn"],
                "description": entry["description"],
            }
        )
    return result


async def main() -> None:
    rows = load_rows()
    if not rows:
        print("No hay filas que importar.")
        return

    unique_names = await fetch_unique_names()

    missing = sorted({row["warframe"] for row in rows} - unique_names.keys())
    if missing:
        print(f"Aviso: warframes sin uniqueName en WFCD: {missing}")

    variant_rows = build_variant_rows(rows, unique_names)
    cosmetic_rows = build_cosmetic_rows(rows)

    async with async_session_factory() as session:
        variant_stmt = insert(WarframeVariant).values(variant_rows)
        variant_stmt = variant_stmt.on_conflict_do_update(
            constraint="warframe_variants_family_variant",
            set_={
                "name": variant_stmt.excluded.name,
                "unique_name": variant_stmt.excluded.unique_name,
            },
        )
        await session.execute(variant_stmt)

        cosmetic_stmt = insert(Cosmetic).values(cosmetic_rows)
        cosmetic_stmt = cosmetic_stmt.on_conflict_do_update(
            constraint="cosmetics_unique",
            set_={
                "image_local": cosmetic_stmt.excluded.image_local,
                "image_cdn": cosmetic_stmt.excluded.image_cdn,
                "description": cosmetic_stmt.excluded.description,
                "updated_at": func.now(),
            },
        )
        await session.execute(cosmetic_stmt)
        await session.commit()

        total_variants = await session.scalar(
            select(func.count()).select_from(WarframeVariant)
        )
        total_cosmetics = await session.scalar(select(func.count()).select_from(Cosmetic))

    print(f"Warframes procesados: {len(variant_rows)}")
    print(f"Cosmeticos procesados: {len(cosmetic_rows)}")
    print(f"Total en warframe_variants: {total_variants}")
    print(f"Total en cosmetics: {total_cosmetics}")


if __name__ == "__main__":
    asyncio.run(main())
