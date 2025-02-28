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
    UserResponse,
    CreateOrg,
    DBOrg,
    PublicOrg,
    PublicOrgWithUsers,
    OrgResponse,
    CreateCollection,
    DBCollection,
    PublicCollection,
    CollectionResponse,
    CreateGroup,
    DBGroup,
    PublicGroup,
    GroupResponse,
    CreateResource,
    DBResource,
    PublicResource,
    ResourceResponse,
    Response,
)

users_router = APIRouter(prefix="/users")


@users_router.get("/", response_model=Response[PublicUserWithOrg])
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

@users_router.get("/{user_id}", response_model=Response[PublicUserWithOrg])
async def get_one_user(
    session: SessionDep,
    user_id: int
) -> Response[PublicUserWithOrg]:
    query = select(DBUser).where(DBUser.id == user_id).where(DBUser.active).options(selectinload(DBUser.org))
    result = await session.execute(query)
    user: PublicUserWithOrg = result.scalars().one()
    response = Response(status=True, more_available=False, items=[user])
    return response


@users_router.post("/", response_model=UserResponse)
async def create_user(session: SessionDep, user: CreateUser):
    db_user = DBUser(username=user.username, hash=user.hash, org_id=user.org_id)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    print(db_user)

    public_user = PublicUser.from_orm(db_user)

    print(public_user)

    response = UserResponse(status=True, more_available=False, users=[public_user])
    return response


# Organizations

orgs_router = APIRouter(prefix="/orgs")


@orgs_router.get("/", response_model=OrgResponse)
async def read_orgs(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> OrgResponse:
    query = select(DBOrg).where(DBOrg.active).options(selectinload(DBOrg.users))
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    orgs: list[PublicOrgWithUsers] = result.scalars().all()

    more_available = len(orgs) > limit

    response = OrgResponse(
        status=True, more_available=more_available, organizations=orgs
    )

    return response


@orgs_router.post("/", response_model=OrgResponse)
async def create_org(session: SessionDep, org: CreateOrg):
    db_org = DBOrg(name=org.name)
    session.add(db_org)
    await session.commit()
    await session.refresh(db_org)

    public_org = PublicOrg.from_orm(db_org)

    response = OrgResponse(
        status=True, more_available=False, organizations=[public_org]
    )
    return response


# Collections

collections_router = APIRouter(prefix="/collections")


@collections_router.get("/", response_model=CollectionResponse)
async def read_collections(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> CollectionResponse:
    query = select(DBCollection).where(DBCollection.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    collections: list[PublicCollection] = result.scalars().all()

    print(collections)

    more_available = len(collections) > limit

    response = CollectionResponse(
        status=True, more_available=more_available, collections=collections
    )

    return response


@collections_router.post("/", response_model=CollectionResponse)
async def create_collection(session: SessionDep, org: CreateCollection):
    db_collection = DBCollection(name=org.name)
    session.add(db_collection)
    await session.commit()
    await session.refresh(db_collection)

    public_collection = PublicCollection.from_orm(db_collection)

    response = CollectionResponse(
        status=True, more_available=False, collections=[public_collection]
    )
    return response


## Groups ##

groups_router = APIRouter(prefix="/groups")


@groups_router.get("/", response_model=GroupResponse)
async def read_groups(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> GroupResponse:
    query = select(DBGroup).where(DBGroup.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    groups: list[PublicGroup] = result.scalars().all()

    print(groups)

    more_available = len(groups) > limit

    response = GroupResponse(status=True, more_available=more_available, groups=groups)

    return response


@groups_router.post("/", response_model=GroupResponse)
async def create_group(session: SessionDep, group: CreateGroup):
    db_group = DBGroup(name=group.name, collection_id=group.collection_id)
    session.add(db_group)
    await session.commit()
    await session.refresh(db_group)

    public_group = PublicGroup.from_orm(db_group)

    response = GroupResponse(status=True, more_available=False, groups=[public_group])
    return response


## Resources ##

resources_router = APIRouter(prefix="/resources")


@resources_router.get("/", response_model=ResourceResponse)
async def read_resources(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> ResourceResponse:
    query = select(DBResource).where(DBResource.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    resources: list[PublicResource] = result.scalars().all()

    print(resources)

    more_available = len(resources) > limit

    response = ResourceResponse(
        status=True, more_available=more_available, resources=resources
    )

    return response


@resources_router.post("/", response_model=ResourceResponse)
async def create_resource(session: SessionDep, org: CreateResource):
    db_resource = DBResource(name=org.name, group_id=org.group_id)
    session.add(db_resource)
    await session.commit()
    await session.refresh(db_resource)

    public_resource = PublicResource.from_orm(db_resource)

    response = ResourceResponse(
        status=True, more_available=False, resources=[public_resource]
    )
    return response
