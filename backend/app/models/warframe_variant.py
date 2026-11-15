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


class WarframeVariant(Base):
    __tablename__ = "warframe_variants"
    __table_args__ = (
        CheckConstraint(
            "variant IN ('base', 'prime', 'umbra')",
            name="warframe_variants_variant_check",
        ),
        UniqueConstraint("family_key", "variant", name="warframe_variants_family_variant"),
        UniqueConstraint("name", name="warframe_variants_name"),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    family_key: Mapped[str] = mapped_column(Text, index=True)
    variant: Mapped[str] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text)
    unique_name: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
