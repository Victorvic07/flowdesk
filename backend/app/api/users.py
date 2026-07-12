from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.security import hash_password
from app.database.connection import get_db
from app.models.ticket import Ticket, TicketStatus
from app.models.user import User, UserRole
from app.repositories.user_repository import (
    create_user,
    get_user_by_email,
)
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserStatusUpdate,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
) -> UserResponse:
    existing_user = get_user_by_email(db, user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um usuário cadastrado com este e-mail.",
        )

    password_hash = hash_password(user_data.password)

    return create_user(
        db=db,
        user_data=user_data,
        password_hash=password_hash,
    )


@router.get(
    "",
    response_model=list[UserResponse],
)
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[User]:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem listar usuários.",
        )

    return (
        db.query(User)
        .order_by(User.id.asc())
        .all()
    )


@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
)
def update_user_status(
    user_id: int,
    status_data: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem alterar usuários.",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    if user.id == current_user.id and not status_data.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Você não pode desativar a própria conta.",
        )

    if user.is_active == status_data.is_active:
        return user

    user.is_active = status_data.is_active

    # Ao desativar um técnico, remove sua atribuição dos
    # chamados que ainda não foram concluídos.
    if (
        not status_data.is_active
        and user.role == UserRole.TECHNICIAN
    ):
        active_tickets = (
            db.query(Ticket)
            .filter(
                Ticket.technician_id == user.id,
                Ticket.status.notin_(
                    [
                        TicketStatus.RESOLVED,
                        TicketStatus.CLOSED,
                    ],
                ),
            )
            .all()
        )

        for ticket in active_tickets:
            ticket.technician_id = None

    db.commit()
    db.refresh(user)

    return user


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user