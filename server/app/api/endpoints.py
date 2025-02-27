from typing import Annotated, Optional

from fastapi import APIRouter, Query
from sqlmodel import select

from app.db.session import SessionDep
from app.models.models import CreateUser, DBUser, PublicUser, UserResponse

router = APIRouter()


@router.get("/users", response_model=UserResponse)
async def read_users(
    session: SessionDep,
    org: Optional[int] = None,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> UserResponse:
    query = select(DBUser).where(DBUser.active)

    if org:
        query = query.where(DBUser.org_id == org)

    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    users: list[PublicUser] = result.scalars().all()

    more_available = len(users) > limit

    response = UserResponse(status=True, more_available=more_available, users=users)

    return response


@router.post("/users", response_model=UserResponse)
async def create_user(session: SessionDep, user: CreateUser):
    db_user = DBUser(username=user.username, hash=user.hash)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    print(db_user)

    public_user = PublicUser.from_orm(db_user)

    print(public_user)

    response = UserResponse(status=True, more_available=False, users=[public_user])
    return response
