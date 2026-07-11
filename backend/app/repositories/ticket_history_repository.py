from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ticket_history import TicketHistory


def create_ticket_history(
    db: Session,
    ticket_id: int,
    user_id: int,
    action: str,
    old_value: str | None = None,
    new_value: str | None = None,
) -> TicketHistory:
    history = TicketHistory(
        ticket_id=ticket_id,
        user_id=user_id,
        action=action,
        old_value=old_value,
        new_value=new_value,
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history


def list_ticket_history(
    db: Session,
    ticket_id: int,
) -> list[TicketHistory]:
    statement = (
        select(TicketHistory)
        .where(TicketHistory.ticket_id == ticket_id)
        .order_by(TicketHistory.created_at.asc())
    )

    return list(db.scalars(statement).all())