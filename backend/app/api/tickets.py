from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.repositories.ticket_repository import create_ticket
from app.schemas.ticket import TicketCreate, TicketResponse
from app.models.ticket import TicketPriority, TicketStatus
from app.repositories.ticket_repository import list_tickets

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"],
)


@router.post(
    "",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def open_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TicketResponse:
    return create_ticket(
        db=db,
        ticket_data=ticket_data,
        requester_id=current_user.id,
    )

@router.get(
    "",
    response_model=list[TicketResponse],
)
def get_tickets(
    status_filter: TicketStatus | None = None,
    priority: TicketPriority | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[TicketResponse]:
    return list_tickets(
        db=db,
        status=status_filter,
        priority=priority,
    )