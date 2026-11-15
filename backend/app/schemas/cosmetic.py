from pydantic import BaseModel


class CosmeticItem(BaseModel):
    id: int
    name: str
    image: str | None = None
    description: str = ""


class WarframeCosmetics(BaseModel):
    warframe: str
    family_key: str
    variant: str
    warframe_unique_name: str | None = None
    skins: list[CosmeticItem]
    helmets: list[CosmeticItem]
