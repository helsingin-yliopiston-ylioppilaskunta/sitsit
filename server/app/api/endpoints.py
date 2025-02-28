from typing import Annotated, Optional

from fastapi import APIRouter, Query
from sqlmodel import select

from sqlalchemy.orm import selectinload

from app.db.session import SessionDep
from app.models.models import (
    CreateUser,
    DBUser,
    PublicUser,
    PublicUserWithOrg,
    CreateOrg,
    DBOrg,
    PublicOrg,
    PublicOrgWithUsers,
    CreateCollection,
    DBCollection,
    PublicCollection,
    CreateGroup,
    DBGroup,
    PublicGroup,
    CreateResource,
    DBResource,
    PublicResource,
    Response,
)

router = APIRouter()


@router.get("/users", response_model=Response[PublicUserWithOrg])
async def read_users(
    session: SessionDep,
    org: Optional[int] = None,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicUserWithOrg]:
    query = select(DBUser).where(DBUser.active).options(selectinload(DBUser.org))

    if org:
        query = query.where(DBUser.org_id == org)

    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    users: list[PublicUserWithOrg] = result.scalars().all()

    more_available = len(users) > limit

    response = Response(status=True, more_available=more_available, items=users)

    return response
    # return users


@router.post("/users", response_model=Response[PublicUserWithOrg])
async def create_user(
    session: SessionDep, user: CreateUser
) -> Response[PublicUserWithOrg]:
    db_user = DBUser(username=user.username, hash=user.hash, org_id=user.org_id)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    print(db_user)

    public_user = PublicUser.from_orm(db_user)

    print(public_user)

    response = Response(status=True, more_available=False, items=[public_user])
    return response


# Organizations


@router.get("/orgs", response_model=Response[PublicOrgWithUsers])
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


@router.post("/orgs", response_model=Response[PublicOrg])
async def create_org(session: SessionDep, org: CreateOrg) -> Response[PublicOrg]:
    db_org = DBOrg(name=org.name)
    session.add(db_org)
    await session.commit()
    await session.refresh(db_org)

    public_org = PublicOrg.from_orm(db_org)

    response = Response(status=True, more_available=False, items=[public_org])
    return response


# Collections


@router.get("/collections", response_model=Response[PublicCollection])
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


@router.post("/collections", response_model=Response[PublicCollection])
async def create_collection(session: SessionDep, org: CreateCollection):
    db_collection = DBCollection(name=org.name)
    session.add(db_collection)
    await session.commit()
    await session.refresh(db_collection)

    public_collection = PublicCollection.from_orm(db_collection)

    response = Response(status=True, more_available=False, items=[public_collection])
    return response


## Groups ##


@router.get("/groups", response_model=Response[PublicGroup])
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


@router.post("/groups", response_model=Response[PublicGroup])
async def create_group(session: SessionDep, group: CreateGroup):
    db_group = DBGroup(name=group.name, collection_id=group.collection_id)
    session.add(db_group)
    await session.commit()
    await session.refresh(db_group)

    public_group = PublicGroup.from_orm(db_group)

    response = Response(status=True, more_available=False, items=[public_group])
    return response


## Resources ##


@router.get("/resources", response_model=Response[PublicGroup])
async def read_resources(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicGroup]:
    query = select(DBResource).where(DBResource.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    resources: list[PublicResource] = result.scalars().all()

    more_available = len(resources) > limit

    response = Response(status=True, more_available=more_available, items=resources)

    return response


@router.post("/resources", response_model=Response[PublicResource])
async def create_resource(session: SessionDep, org: CreateResource):
    db_resource = DBResource(name=org.name, group_id=org.group_id)
    session.add(db_resource)
    await session.commit()
    await session.refresh(db_resource)

    public_resource = PublicResource.from_orm(db_resource)

    response = Response(status=True, more_available=False, items=[public_resource])
    return response
