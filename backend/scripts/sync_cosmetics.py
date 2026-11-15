"""Compara tus cosmeticos con los skins/helmets de WFCD.

Acciones (desde backend/):
    PYTHONPATH=. ./venv/Scripts/python.exe scripts/sync_cosmetics.py report
    PYTHONPATH=. ./venv/Scripts/python.exe scripts/sync_cosmetics.py report --details
    PYTHONPATH=. ./venv/Scripts/python.exe scripts/sync_cosmetics.py enrich

`watch`   : dice qué warframes y skins/helmets han aparecido en WFCD desde la
            última vez que lo ejecutaste. La primera vez guarda una "foto" de
            hoy como referencia; las siguientes comparan contra ella. También
            indica si cada novedad ya está en tu base.
`report`  : no modifica nada. Muestra warframes nuevos en la API y, por familia,
            cuantos cosméticos de WFCD están enlazados (tienen su `unique_name`),
            reconocidos por nombre, o faltan en tu base.
`enrich`  : rellena `unique_name` en tus filas cuando el nombre coincide de forma
            clara con un skin/helmet de WFCD. No toca nombres ni imágenes y no
            sobrescribe un `unique_name` ya existente.
"""

import argparse
import asyncio
import json
import re
from datetime import datetime
from pathlib import Path

import httpx
from sqlalchemy import select

from app.core.database import async_session_factory, engine
from app.models import Cosmetic, WarframeVariant

SKINS_URL = (
    "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Skins.json"
)
WARFRAMES_URL = (
    "https://api.warframestat.us/warframes"
    "?only=name,uniqueName,category,type,productCategory,introduced"
)
SNAPSHOT_FILE = Path(__file__).parent / "data" / "wfcd_snapshot.json"


def segment_of(unique_name: str | None) -> str | None:
    parts = (unique_name or "").split("/")
    return parts[-2] if len(parts) >= 2 else None


def norm(value: str | None) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[-_]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def classify(name: str) -> tuple[str | None, str | None, bool]:
    text = norm(name)
    arcane = text.startswith("arcane ")
    if arcane:
        text = text[len("arcane "):]
    if text.endswith(" skin"):
        return "skin", text[: -len(" skin")].strip(), arcane
    if text.endswith(" helmet"):
        return "helmet", text[: -len(" helmet")].strip(), arcane
    return None, None, arcane


def catalog_core(name: str, kind: str) -> str:
    """Nombre de tu catalogo sin el sufijo " Skin"/" Helmet"."""
    text = norm(name)
    suffix = " skin" if kind == "skin" else " helmet"
    if text.endswith(suffix):
        text = text[: -len(suffix)].strip()
    return text


def strip_prefix(core: str, base_name: str) -> str:
    base = norm(base_name)
    if core == base:
        return ""
    if core.startswith(base + " "):
        return core[len(base) + 1:]
    return core


def build_entries(skins: list[dict], base_variant: WarframeVariant) -> list[dict]:
    """Skins/helmets de WFCD de una familia, con su nombre "corto"."""
    segment = segment_of(base_variant.unique_name)
    marker = f"/Skins/{segment}/" if segment else None

    candidates = [
        skin
        for skin in skins
        if skin.get("type") in ("Skin", "Skins")
        and marker is not None
        and marker in (skin.get("uniqueName") or "")
    ]

    # Algunos warframes (p.ej. Banshee) guardan sus skins bajo otra carpeta
    # interna. Si no aparece nada por la ruta, se buscan por nombre.
    if not candidates:
        prefix = norm(base_variant.name) + " "
        candidates = [
            skin
            for skin in skins
            if skin.get("type") in ("Skin", "Skins")
            and norm(skin.get("name", "")).startswith(prefix)
        ]

    entries: dict[tuple[str, str], dict] = {}

    for skin in candidates:
        kind, core, arcane = classify(skin.get("name", ""))
        if kind is None:
            continue
        core = strip_prefix(core, base_variant.name)
        # "" es el aspecto original; "prime"/"umbra" son los aspectos de esas
        # variantes, que no forman parte del catalogo de skins alternativas.
        if core in ("", "prime", "umbra"):
            continue
        key = (kind, core)
        previous = entries.get(key)
        if previous is None or (previous["arcane"] and not arcane):
            entries[key] = {
                "unique_name": skin["uniqueName"],
                "name": skin.get("name", ""),
                "kind": kind,
                "core": core,
                "arcane": arcane,
            }

    return list(entries.values())


async def load_families(session) -> dict[str, WarframeVariant]:
    variants = (await session.execute(select(WarframeVariant))).scalars().all()
    families: dict[str, WarframeVariant] = {}
    for variant in variants:
        current = families.get(variant.family_key)
        if current is None or variant.variant == "base":
            families[variant.family_key] = variant
    return families


async def fetch_skins() -> list[dict]:
    async with httpx.AsyncClient(timeout=120, follow_redirects=True) as client:
        response = await client.get(SKINS_URL)
        response.raise_for_status()
        return response.json()


async def fetch_warframes() -> list[dict]:
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.get(WARFRAMES_URL)
        response.raise_for_status()
        return response.json()


def is_relevant_skin(skin: dict) -> bool:
    """Solo skins/helmets de verdad (fuera paletas, naves, decoraciones...)."""
    if skin.get("type") not in ("Skin", "Skins"):
        return False
    name = norm(skin.get("name", ""))
    if name.startswith("arcane "):
        return False
    return name.endswith(" skin") or name.endswith(" helmet")


def build_snapshot(skins: list[dict], warframes: list[dict]) -> dict:
    return {
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "warframes": [
            {
                "uniqueName": warframe.get("uniqueName"),
                "name": warframe.get("name"),
                "type": warframe.get("type"),
                "category": warframe.get("category"),
                "productCategory": warframe.get("productCategory"),
                "introduced": (warframe.get("introduced") or {}).get("date"),
            }
            for warframe in warframes
        ],
        "skins": [
            {"uniqueName": skin["uniqueName"], "name": skin.get("name", "")}
            for skin in skins
            if is_relevant_skin(skin)
        ],
    }


async def watch(save: bool) -> None:
    skins = await fetch_skins()
    warframes = await fetch_warframes()
    current = build_snapshot(skins, warframes)

    SNAPSHOT_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not SNAPSHOT_FILE.exists():
        SNAPSHOT_FILE.write_text(
            json.dumps(current, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print("Primera ejecucion: he guardado una foto de WFCD de hoy como referencia.")
        print(
            f"Warframes: {len(current['warframes'])}, "
            f"skins/helmets: {len(current['skins'])}"
        )
        print(f"Archivo: {SNAPSHOT_FILE}")
        print("La proxima vez te dire que ha cambiado desde ahora.")
        await engine.dispose()
        return

    previous = json.loads(SNAPSHOT_FILE.read_text(encoding="utf-8"))
    previous_warframes = {item["uniqueName"] for item in previous.get("warframes", [])}
    previous_skins = {item["uniqueName"] for item in previous.get("skins", [])}

    new_warframes = [
        item
        for item in current["warframes"]
        if item["uniqueName"] not in previous_warframes
    ]
    new_skins = [
        item for item in current["skins"] if item["uniqueName"] not in previous_skins
    ]

    async with async_session_factory() as session:
        linked_skins = {
            value
            for value in (
                await session.execute(
                    select(Cosmetic.unique_name).where(Cosmetic.unique_name.is_not(None))
                )
            ).scalars()
        }
        known_warframes = {
            norm(value)
            for value in (
                await session.execute(select(WarframeVariant.name))
            ).scalars()
        }

    def mark(owned: bool) -> str:
        return "ya en tu base" if owned else "NO en tu base"

    print(f"Comparando con la foto del {previous.get('generated_at')}")
    print()

    real = [
        item
        for item in new_warframes
        if item.get("type") == "Warframe" and item.get("productCategory")
    ]
    real_ids = {item["uniqueName"] for item in real}
    others = [item for item in new_warframes if item["uniqueName"] not in real_ids]

    print(f"Nuevos warframes: {len(real)}")
    for item in sorted(real, key=lambda value: value["name"] or ""):
        introduced = f" ({item['introduced']})" if item.get("introduced") else ""
        owned = mark(norm(item["name"]) in known_warframes)
        print(f"  - {item['name']}{introduced} -> {owned}")
    if not real:
        print("  (ninguno)")

    if others:
        print()
        print(f"Otros nuevos (archwing/necramech/...): {len(others)}")
        for item in sorted(others, key=lambda value: value["name"] or ""):
            print(f"  - {item['name']} [{item.get('type')}]")

    print()
    print(f"Nuevas skins/helmets: {len(new_skins)}")
    for item in sorted(new_skins, key=lambda value: value["name"]):
        owned = mark(item["uniqueName"] in linked_skins)
        print(f"  - {item['name']} -> {owned}")
        print(f"      [{item['uniqueName']}]")
    if not new_skins:
        print("  (ninguna)")

    if save:
        SNAPSHOT_FILE.write_text(
            json.dumps(current, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print()
        print(f"Foto actualizada: {SNAPSHOT_FILE}")
    else:
        print()
        print("Modo --no-save: la foto NO se ha actualizado.")

    await engine.dispose()


async def enrich() -> None:
    skins = await fetch_skins()

    async with async_session_factory() as session:
        families = await load_families(session)
        cosmetics = (await session.execute(select(Cosmetic))).scalars().all()
        entries_by_family = {
            family_key: build_entries(skins, base)
            for family_key, base in families.items()
        }

        filled = 0
        already = 0
        pending = 0

        for cosmetic in cosmetics:
            if cosmetic.unique_name:
                already += 1
                continue

            base = families.get(cosmetic.family_key)
            if base is None:
                pending += 1
                continue

            wanted = catalog_core(cosmetic.name, cosmetic.kind)
            matches = [
                entry
                for entry in entries_by_family.get(cosmetic.family_key, [])
                if entry["kind"] == cosmetic.kind and entry["core"] == wanted
            ]
            if len(matches) == 1:
                cosmetic.unique_name = matches[0]["unique_name"]
                filled += 1
            else:
                pending += 1

        await session.commit()

    print(f"Enlazados ahora: {filled}")
    print(f"Ya tenian unique_name: {already}")
    print(f"Sin enlazar (revisar a mano): {pending}")
    await engine.dispose()


async def report(details: bool, family_filter: str | None) -> None:
    skins = await fetch_skins()
    wanted_family = norm(family_filter) if family_filter else None

    # Solo warframes reales: fuera Archwings, Necramechs y Helminth.
    api_warframes = [
        warframe
        for warframe in await fetch_warframes()
        if warframe.get("type") == "Warframe" and warframe.get("productCategory")
    ]

    async with async_session_factory() as session:
        variants = (await session.execute(select(WarframeVariant))).scalars().all()
        families = await load_families(session)
        cosmetics = (await session.execute(select(Cosmetic))).scalars().all()

        by_family: dict[str, list[Cosmetic]] = {}
        for cosmetic in cosmetics:
            by_family.setdefault(cosmetic.family_key, []).append(cosmetic)

        print("=== Warframes nuevos en la API (no estan en tu base) ===")
        known = {norm(variant.name) for variant in variants}
        new_warframes = [
            warframe["name"]
            for warframe in api_warframes
            if norm(warframe.get("name")) not in known
        ]
        if new_warframes:
            for name in sorted(new_warframes):
                print(f"  - {name}")
        else:
            print("  (ninguno)")

        print()
        print("=== Skins/helmets de WFCD que no estan en tu base ===")

        total_linked = 0
        total_by_name = 0
        total_missing = 0
        no_wfcd = []

        for family_key in sorted(families):
            base = families[family_key]
            if wanted_family and wanted_family not in (norm(family_key), norm(base.name)):
                continue
            entries = build_entries(skins, base)
            if not entries:
                no_wfcd.append(base.name)
                continue

            db_rows = by_family.get(family_key, [])
            linked_ids = {row.unique_name for row in db_rows if row.unique_name}
            db_names = {
                (row.kind, catalog_core(row.name, row.kind)) for row in db_rows
            }

            linked = 0
            by_name = 0
            missing = []
            for entry in entries:
                if entry["unique_name"] in linked_ids:
                    linked += 1
                elif (entry["kind"], entry["core"]) in db_names:
                    by_name += 1
                else:
                    missing.append(entry)

            total_linked += linked
            total_by_name += by_name
            total_missing += len(missing)

            if missing or details:
                print(
                    f"  {base.name} ({family_key}): {linked} enlazadas, "
                    f"{by_name} por nombre, {len(missing)} faltan"
                )
                if details:
                    for entry in missing:
                        print(
                            f"      FALTA  {entry['kind']:6} {entry['core']}"
                            f"  [{entry['unique_name']}]"
                        )

        print()
        print(f"Total con id enlazado: {total_linked}")
        print(f"Total reconocido por nombre (sin id): {total_by_name}")
        print(f"Total en WFCD que no aparecen en tu base: {total_missing}")

        unlinked = [row for row in cosmetics if not row.unique_name]
        print(f"Cosmeticos en tu base sin unique_name: {len(unlinked)}")

        if no_wfcd:
            print()
            print("Aviso: familias sin skins encontradas en WFCD (revisar):")
            for name in sorted(no_wfcd):
                print(f"  - {name}")

    await engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Compara tus cosmeticos con los skins/helmets de WFCD."
    )
    parser.add_argument("action", choices=["watch", "report", "enrich"])
    parser.add_argument(
        "--details",
        action="store_true",
        help="En el informe, lista cada skin/helmet que falta.",
    )
    parser.add_argument(
        "--family",
        default=None,
        help="Limita el informe a un warframe (nombre o family_key).",
    )
    parser.add_argument(
        "--no-save",
        action="store_true",
        help="En 'watch', muestra los cambios pero no actualiza la foto.",
    )
    args = parser.parse_args()

    if args.action == "enrich":
        asyncio.run(enrich())
    elif args.action == "watch":
        asyncio.run(watch(save=not args.no_save))
    else:
        asyncio.run(report(args.details, args.family))


if __name__ == "__main__":
    main()
