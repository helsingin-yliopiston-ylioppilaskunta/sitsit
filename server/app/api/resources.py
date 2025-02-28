from typing import Annotated, Optional

from fastapi import APIRouter, Query

from sqlmodel import select
from sqlalchemy.orm import selectinload

from app.db.session import SessionDep


from app.models.resource import (
    CreateResource,
    DBResource,
    PublicResource,
)

from app.models.response import Response

# Response[PublicUserWithOrg].model_rebuild()

router = APIRouter(prefix="/resources")


@router.get("/", response_model=Response[PublicResource])
async def read_resources(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicResource]:
    query = select(DBResource).where(DBResource.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    resources: list[PublicResource] = result.scalars().all()

    more_available = len(resources) > limit

    response = Response(status=True, more_available=more_available, items=resources)

    return response


@router.post("/", response_model=Response[PublicResource])
async def create_resource(session: SessionDep, org: CreateResource):
    db_resource = DBResource(name=org.name, group_id=org.group_id)
    session.add(db_resource)
    await session.commit()
    await session.refresh(db_resource)

    public_resource = PublicResource.from_orm(db_resource)

    response = Response(status=True, more_available=False, items=[public_resource])
    return response
