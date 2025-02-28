from typing import Annotated, Optional

from fastapi import APIRouter, Query

from sqlmodel import select
from sqlalchemy.orm import selectinload

from app.db.session import SessionDep


from app.models.group import (
    CreateGroup,
    DBGroup,
    PublicGroup,
)

from app.models.response import Response

# Response[PublicUserWithOrg].model_rebuild()

router = APIRouter(prefix="/groups")


@router.get("/", response_model=Response[PublicGroup])
async def read_groups(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicGroup]:
    query = select(DBGroup).where(DBGroup.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    groups: list[PublicGroup] = result.scalars().all()

    more_available = len(groups) > limit
    response = Response(status=True, more_available=more_available, items=groups)

    return response


@router.post("/", response_model=Response[PublicGroup])
async def create_group(session: SessionDep, group: CreateGroup):
    db_group = DBGroup(name=group.name, collection_id=group.collection_id)
    session.add(db_group)
    await session.commit()
    await session.refresh(db_group)

    public_group = PublicGroup.from_orm(db_group)

    response = Response(status=True, more_available=False, items=[public_group])
    return response

