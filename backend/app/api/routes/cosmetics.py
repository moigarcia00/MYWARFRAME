from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.warframe_family import family_key_for, split_variant
from app.models import Cosmetic, WarframeVariant
from app.schemas.cosmetic import CosmeticItem, WarframeCosmetics

router = APIRouter(tags=["cosmetics"])


def _resolve_image(image_local: str | None, image_cdn: str | None) -> str | None:
    return image_local or image_cdn


def _build_items(rows: list[Cosmetic]) -> tuple[list[CosmeticItem], list[CosmeticItem]]:
    skins: list[CosmeticItem] = []
    helmets: list[CosmeticItem] = []

    for row in rows:
        item = CosmeticItem(
            id=row.id,
            name=row.name,
            image=_resolve_image(row.image_local, row.image_cdn),
            description=row.description or "",
        )
        if row.kind == "skin":
            skins.append(item)
        else:
            helmets.append(item)

    return skins, helmets


async def _resolve_identity(
    session: AsyncSession, requested: str
) -> tuple[str, str, str, str | None]:
    """Devuelve (family_key, variant, nombre_canónico, unique_name)."""
    result = await session.execute(
        select(WarframeVariant).where(
            func.lower(WarframeVariant.name) == requested.strip().lower()
        )
    )
    variant_row = result.scalar_one_or_none()
    if variant_row is not None:
        return (
            variant_row.family_key,
            variant_row.variant,
            variant_row.name,
            variant_row.unique_name,
        )

    # Warframe no registrado (p.ej. un Prime reciente sin catálogo propio):
    # deducimos la familia quitando el sufijo y no inventamos uniqueName.
    base, variant = split_variant(requested)
    return family_key_for(base), variant, requested, None


@router.get("/cosmetics/{warframe}", response_model=WarframeCosmetics)
async def get_warframe_cosmetics(
    warframe: str,
    session: AsyncSession = Depends(get_session),
) -> WarframeCosmetics:
    requested = warframe.strip()
    family_key, variant, identity_name, identity_unique = await _resolve_identity(
        session, requested
    )

    # Se devuelven las skins compartidas por la familia más las exclusivas de la
    # variante pedida. Las skins de la base se guardan como 'shared', así que un
    # Prime/Umbra también las recibe.
    result = await session.execute(
        select(Cosmetic)
        .where(Cosmetic.family_key == family_key)
        .where(Cosmetic.variant.in_(("shared", variant)))
        .order_by(Cosmetic.kind, Cosmetic.name)
    )
    rows = list(result.scalars().all())

    skins, helmets = _build_items(rows)

    return WarframeCosmetics(
        warframe=identity_name,
        family_key=family_key,
        variant=variant,
        warframe_unique_name=identity_unique,
        skins=skins,
        helmets=helmets,
    )
