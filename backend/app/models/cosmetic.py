from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    Identity,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class _CosmeticColumns:
    id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    family_key: Mapped[str] = mapped_column(Text, index=True)
    variant: Mapped[str] = mapped_column(Text, default="shared")
    name: Mapped[str] = mapped_column(Text)
    unique_name: Mapped[str | None] = mapped_column(Text, index=True)
    image: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Skin(_CosmeticColumns, Base):
    __tablename__ = "skins"
    __table_args__ = (
        CheckConstraint(
            "variant IN ('shared', 'base', 'prime', 'umbra')",
            name="skins_variant_check",
        ),
        UniqueConstraint("family_key", "variant", "name", name="skins_unique"),
    )

    @property
    def kind(self) -> str:
        return "skin"


class Helmet(_CosmeticColumns, Base):
    __tablename__ = "helmets"
    __table_args__ = (
        CheckConstraint(
            "variant IN ('shared', 'base', 'prime', 'umbra')",
            name="helmets_variant_check",
        ),
        UniqueConstraint("family_key", "variant", "name", name="helmets_unique"),
    )

    @property
    def kind(self) -> str:
        return "helmet"
