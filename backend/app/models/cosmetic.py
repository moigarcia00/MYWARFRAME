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


class Cosmetic(Base):
    __tablename__ = "cosmetics"
    __table_args__ = (
        CheckConstraint("kind IN ('skin', 'helmet')", name="cosmetics_kind_check"),
        UniqueConstraint("warframe", "kind", "name", name="cosmetics_unique"),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    warframe: Mapped[str] = mapped_column(Text)
    warframe_unique_name: Mapped[str | None] = mapped_column(Text)
    kind: Mapped[str] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text)
    image_local: Mapped[str | None] = mapped_column(Text)
    image_cdn: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
