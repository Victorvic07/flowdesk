from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.models.user import User, UserRole
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
    current_user: User,
    status: TicketStatus | None = None,
    priority: TicketPriority | None = None,
) -> list[Ticket]:
    statement = select(Ticket)

    if current_user.role == UserRole.REQUESTER:
        statement = statement.where(
            Ticket.requester_id == current_user.id
        )

    elif current_user.role == UserRole.TECHNICIAN:
        statement = statement.where(
            or_(
                Ticket.technician_id == current_user.id,
                Ticket.technician_id.is_(None),
            )
        )

    if status is not None:
        statement = statement.where(Ticket.status == status)

    if priority is not None:
        statement = statement.where(Ticket.priority == priority)

    statement = statement.order_by(Ticket.created_at.desc())

    return list(db.scalars(statement).all())


def get_ticket_by_id(
    db: Session,
    ticket_id: int,
) -> Ticket | None:
    return db.get(Ticket, ticket_id)

def assign_ticket_to_technician(
    db: Session,
    ticket: Ticket,
    technician_id: int,
) -> Ticket:
    ticket.technician_id = technician_id
    ticket.status = TicketStatus.IN_PROGRESS

    db.commit()
    db.refresh(ticket)

    return ticket

def update_ticket_status(
    db: Session,
    ticket: Ticket,
    new_status: TicketStatus,
) -> Ticket:
    ticket.status = new_status

    db.commit()
    db.refresh(ticket)

    return ticket