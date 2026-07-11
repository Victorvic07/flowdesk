from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.models.user import User, UserRole
from app.repositories.ticket_repository import (
    create_ticket,
    get_ticket_by_id,
    list_tickets,
)
from app.schemas.ticket import TicketCreate, TicketResponse


router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"],
)


def user_can_access_ticket(
    user: User,
    ticket: Ticket,
) -> bool:
    if user.role == UserRole.ADMIN:
        return True

    if user.role == UserRole.REQUESTER:
        return ticket.requester_id == user.id

    if user.role == UserRole.TECHNICIAN:
        return (
            ticket.technician_id == user.id
            or ticket.technician_id is None
        )

    return False


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
        current_user=current_user,
        status=status_filter,
        priority=priority,
    )


@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
)
def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TicketResponse:
    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado não encontrado.",
        )

    if not user_can_access_ticket(current_user, ticket):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não possui permissão para acessar este chamado.",
        )

    return ticket