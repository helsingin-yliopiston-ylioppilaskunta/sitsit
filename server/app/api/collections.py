from typing import Annotated, Optional

from fastapi import APIRouter, Query

from sqlmodel import select
from sqlalchemy.orm import selectinload

from app.db.session import SessionDep


from app.models.collection import (
    CreateCollection,
    DBCollection,
    PublicCollection,
)

from app.models.response import Response

# Response[PublicUserWithOrg].model_rebuild()

router = APIRouter(prefix="/collections")


@router.get("/", response_model=Response[PublicCollection])
async def read_collections(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicCollection]:
    query = select(DBCollection).where(DBCollection.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    collections: list[PublicCollection] = result.scalars().all()

    more_available = len(collections) > limit

    response = Response(status=True, more_available=more_available, items=collections)

    return response


@router.post("/", response_model=Response[PublicCollection])
async def create_collection(session: SessionDep, org: CreateCollection):
    db_collection = DBCollection(name=org.name)
    session.add(db_collection)
    await session.commit()
    await session.refresh(db_collection)

    public_collection = PublicCollection.from_orm(db_collection)

    response = Response(status=True, more_available=False, items=[public_collection])
    return response
