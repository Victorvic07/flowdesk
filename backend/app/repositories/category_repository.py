from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate


def get_category_by_name(
    db: Session,
    name: str,
) -> Category | None:
    statement = select(Category).where(Category.name == name)
    return db.scalar(statement)


def get_category_by_id(
    db: Session,
    category_id: int,
) -> Category | None:
    return db.get(Category, category_id)


def create_category(
    db: Session,
    category_data: CategoryCreate,
) -> Category:
    category = Category(
        name=category_data.name,
        description=category_data.description,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def list_categories(
    db: Session,
) -> list[Category]:
    statement = (
        select(Category)
        .where(Category.is_active.is_(True))
        .order_by(Category.name.asc())
    )

    return list(db.scalars(statement).all())