from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.schemas.ticket import TicketCreate


def create_ticket(
    db: Session,
    ticket_data: TicketCreate,
    requester_id: int,
) -> Ticket:
    ticket = Ticket(
        title=ticket_data.title,
        description=ticket_data.description,
        priority=ticket_data.priority,
        requester_id=requester_id,
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


def list_tickets(
    db: Session,
    status: TicketStatus | None = None,
    priority: TicketPriority | None = None,
) -> list[Ticket]:
    statement = select(Ticket)

    if status is not None:
        statement = statement.where(Ticket.status == status)

    if priority is not None:
        statement = statement.where(Ticket.priority == priority)

    statement = statement.order_by(Ticket.created_at.desc())

    return list(db.scalars(statement).all())