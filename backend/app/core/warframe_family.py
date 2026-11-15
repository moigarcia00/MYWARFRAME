"""Utilidades para agrupar warframes por familia y variante.

Una "familia" es la base común (p.ej. `ash`) y cada warframe es una variante
(`base`, `prime`, `umbra`). Las skins de la base se consideran compartidas.
"""

VARIANT_SUFFIXES = ((" prime", "prime"), (" umbra", "umbra"))
VARIANT_NAMES = ("base", "prime", "umbra")


def split_variant(name: str) -> tuple[str, str]:
    """Devuelve (nombre_base, variante) a partir del nombre del warframe."""
    lowered = name.lower()
    for suffix, variant in VARIANT_SUFFIXES:
        if lowered.endswith(suffix):
            return name[: -len(suffix)].strip(), variant
    return name.strip(), "base"


def family_key_for(base: str) -> str:
    """Clave de familia estable a partir del nombre base (p.ej. 'Excalibur' -> 'excalibur')."""
    return base.strip().lower().replace(" ", "-")


def stored_variant(variants: set[str]) -> str:
    """Variante con la que se guarda un cosmetico segun donde aparezca.

    Si aparece en la base se guarda como `shared` (en el juego la version
    Prime/Umbra puede usar las skins de su base). Solo lo que aparece
    unicamente en una variante no-base se guarda como exclusivo de ella.
    """
    if "base" in variants:
        return "shared"
    if len(variants) == 1:
        return next(iter(variants))
    return "shared"
