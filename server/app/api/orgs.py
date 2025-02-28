from typing import Annotated, Optional

from fastapi import APIRouter, Query

from sqlmodel import select
from sqlalchemy.orm import selectinload

from app.db.session import SessionDep

from app.models import CreateOrg, DBOrg, PublicOrg, PublicOrgWithUsers

from app.models import Response

# Response[PublicOrgWithUsers].model_rebuild()

router = APIRouter(prefix="/orgs")


@router.get("/", response_model=Response[PublicOrgWithUsers])
async def read_orgs(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicOrgWithUsers]:
    query = select(DBOrg).where(DBOrg.active).options(selectinload(DBOrg.users))
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    orgs: list[PublicOrgWithUsers] = result.scalars().all()

    more_available = len(orgs) > limit

    response = Response(status=True, more_available=more_available, items=orgs)

    return response


@router.post("/", response_model=Response[PublicOrg])
async def create_org(session: SessionDep, org: CreateOrg) -> Response[PublicOrg]:
    db_org = DBOrg(name=org.name)
    session.add(db_org)
    await session.commit()
    await session.refresh(db_org)

    public_org = PublicOrg.from_orm(db_org)

    response = Response(status=True, more_available=False, items=[public_org])
    return response
