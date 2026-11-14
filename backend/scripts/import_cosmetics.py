import asyncio
import json
from pathlib import Path

import httpx
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from app.core.database import async_session_factory
from app.models import Cosmetic

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


async def main() -> None:
    rows = load_rows()
    if not rows:
        print("No hay filas que importar.")
        return

    unique_names = await fetch_unique_names()

    missing = sorted({row["warframe"] for row in rows} - unique_names.keys())
    if missing:
        print(f"Aviso: warframes sin uniqueName en WFCD: {missing}")

    for row in rows:
        row["warframe_unique_name"] = unique_names.get(row["warframe"])

    async with async_session_factory() as session:
        statement = insert(Cosmetic).values(rows)
        statement = statement.on_conflict_do_update(
            constraint="cosmetics_unique",
            set_={
                "warframe_unique_name": statement.excluded.warframe_unique_name,
                "image_local": statement.excluded.image_local,
                "image_cdn": statement.excluded.image_cdn,
                "description": statement.excluded.description,
                "updated_at": func.now(),
            },
        )
        await session.execute(statement)
        await session.commit()

        total = await session.scalar(select(func.count()).select_from(Cosmetic))

    print(f"Filas procesadas: {len(rows)}")
    print(f"Total en cosmetics: {total}")


if __name__ == "__main__":
    asyncio.run(main())
