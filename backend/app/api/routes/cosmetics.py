from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.warframe_family import family_key_for, split_variant
from app.models import Helmet, Skin, WarframeVariant
from app.schemas.cosmetic import CosmeticItem, WarframeHelmets, WarframeSkins

router = APIRouter(tags=["cosmetics"])


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


async def _query_items(
    session: AsyncSession, model: type[Skin] | type[Helmet], family_key: str, variant: str
) -> list[CosmeticItem]:
    result = await session.execute(
        select(model)
        .where(model.family_key == family_key)
        .where(model.variant.in_(("shared", variant)))
        .order_by(model.name)
    )
    return [
        CosmeticItem(
            id=row.id,
            name=row.name,
            image=row.image,
            description=row.description or "",
        )
        for row in result.scalars().all()
    ]


@router.get("/skins/{warframe}", response_model=WarframeSkins)
async def get_warframe_skins(
    warframe: str,
    session: AsyncSession = Depends(get_session),
) -> WarframeSkins:
    requested = warframe.strip()
    family_key, variant, identity_name, identity_unique = await _resolve_identity(
        session, requested
    )
    items = await _query_items(session, Skin, family_key, variant)

    return WarframeSkins(
        warframe=identity_name,
        family_key=family_key,
        variant=variant,
        warframe_unique_name=identity_unique,
        skins=items,
    )


@router.get("/helmets/{warframe}", response_model=WarframeHelmets)
async def get_warframe_helmets(
    warframe: str,
    session: AsyncSession = Depends(get_session),
) -> WarframeHelmets:
    requested = warframe.strip()
    family_key, variant, identity_name, identity_unique = await _resolve_identity(
        session, requested
    )
    items = await _query_items(session, Helmet, family_key, variant)

    return WarframeHelmets(
        warframe=identity_name,
        family_key=family_key,
        variant=variant,
        warframe_unique_name=identity_unique,
        helmets=items,
    )
