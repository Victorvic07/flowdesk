from sqlalchemy.orm import Session

from app.models.ticket import Ticket
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