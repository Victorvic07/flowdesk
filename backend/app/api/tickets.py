from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.comment import Comment
from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.models.ticket_history import TicketHistory
from app.models.user import User, UserRole
from app.repositories.category_repository import get_category_by_id
from app.repositories.comment_repository import (
    create_comment,
    list_comments,
)
from app.repositories.ticket_history_repository import (
    create_ticket_history,
    list_ticket_history,
)
from app.repositories.ticket_repository import (
    assign_ticket_to_technician,
    create_ticket,
    get_ticket_by_id,
    list_tickets,
    update_ticket_status,
)
from app.schemas.comment import CommentCreate, CommentResponse
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketStatusUpdate,
)
from app.schemas.ticket_history import TicketHistoryResponse


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
    category = get_category_by_id(
        db=db,
        category_id=ticket_data.category_id,
    )

    if category is None or not category.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada ou inativa.",
        )

    ticket = create_ticket(
        db=db,
        ticket_data=ticket_data,
        requester_id=current_user.id,
    )

    create_ticket_history(
        db=db,
        ticket_id=ticket.id,
        user_id=current_user.id,
        action="TICKET_CREATED",
        new_value=ticket.status.value,
    )

    return ticket


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


@router.delete(
    "/{ticket_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem excluir chamados.",
        )

    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado não encontrado.",
        )

    try:
        db.query(Comment).filter(
            Comment.ticket_id == ticket_id,
        ).delete(synchronize_session=False)

        db.query(TicketHistory).filter(
            TicketHistory.ticket_id == ticket_id,
        ).delete(synchronize_session=False)

        db.delete(ticket)
        db.commit()

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível excluir o chamado.",
        ) from error


@router.patch(
    "/{ticket_id}/assign-to-me",
    response_model=TicketResponse,
)
def assign_ticket_to_me(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TicketResponse:
    if current_user.role not in {
        UserRole.TECHNICIAN,
        UserRole.ADMIN,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Apenas técnicos ou administradores "
                "podem assumir chamados."
            ),
        )

    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado não encontrado.",
        )

    if (
        ticket.technician_id is not None
        and ticket.technician_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este chamado já foi atribuído a outro técnico.",
        )

    old_technician_id = ticket.technician_id

    updated_ticket = assign_ticket_to_technician(
        db=db,
        ticket=ticket,
        technician_id=current_user.id,
    )

    create_ticket_history(
        db=db,
        ticket_id=ticket.id,
        user_id=current_user.id,
        action="TICKET_ASSIGNED",
        old_value=(
            str(old_technician_id)
            if old_technician_id is not None
            else None
        ),
        new_value=str(current_user.id),
    )

    return updated_ticket


@router.patch(
    "/{ticket_id}/status",
    response_model=TicketResponse,
)
def change_ticket_status(
    ticket_id: int,
    status_data: TicketStatusUpdate,
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

    if current_user.role == UserRole.REQUESTER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solicitantes não podem alterar o status do chamado.",
        )

    if (
        current_user.role == UserRole.TECHNICIAN
        and ticket.technician_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não é o técnico responsável por este chamado.",
        )

    old_status = ticket.status.value

    updated_ticket = update_ticket_status(
        db=db,
        ticket=ticket,
        new_status=status_data.status,
    )

    create_ticket_history(
        db=db,
        ticket_id=ticket.id,
        user_id=current_user.id,
        action="STATUS_CHANGED",
        old_value=old_status,
        new_value=status_data.status.value,
    )

    return updated_ticket


@router.post(
    "/{ticket_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_comment(
    ticket_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommentResponse:
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
            detail="Você não possui permissão para comentar neste chamado.",
        )

    comment = create_comment(
        db=db,
        ticket_id=ticket_id,
        author_id=current_user.id,
        content=comment_data.content,
    )

    create_ticket_history(
        db=db,
        ticket_id=ticket_id,
        user_id=current_user.id,
        action="COMMENT_ADDED",
        new_value=str(comment.id),
    )

    return comment


@router.get(
    "/{ticket_id}/comments",
    response_model=list[CommentResponse],
)
def get_comments(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CommentResponse]:
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
            detail="Você não possui permissão para visualizar os comentários.",
        )

    return list_comments(
        db=db,
        ticket_id=ticket_id,
    )


@router.get(
    "/{ticket_id}/history",
    response_model=list[TicketHistoryResponse],
)
def get_ticket_history(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[TicketHistoryResponse]:
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
            detail="Você não possui permissão para visualizar o histórico.",
        )

    return list_ticket_history(
        db=db,
        ticket_id=ticket_id,
    )