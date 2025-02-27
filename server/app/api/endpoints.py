from typing import Annotated, Optional

from fastapi import APIRouter, Query
from sqlmodel import select

from app.db.session import SessionDep
from app.models.models import (
    CreateUser,
    DBUser,
    PublicUser,
    UserResponse,
    CreateOrg,
    DBOrg,
    PublicOrg,
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
)

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


# Organizations


@router.get("/orgs", response_model=OrgResponse)
async def read_orgs(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> OrgResponse:
    query = select(DBOrg).where(DBOrg.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    orgs: list[PublicOrg] = result.scalars().all()

    print(orgs)

    more_available = len(orgs) > limit

    response = OrgResponse(
        status=True, more_available=more_available, organizations=orgs
    )

    return response


@router.post("/orgs", response_model=OrgResponse)
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


@router.get("/collections", response_model=CollectionResponse)
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


@router.post("/collections", response_model=CollectionResponse)
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


@router.get("/groups", response_model=GroupResponse)
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


@router.post("/groups", response_model=GroupResponse)
async def create_group(session: SessionDep, group: CreateGroup):
    db_group = DBGroup(name=group.name, collection_id=group.collection_id)
    session.add(db_group)
    await session.commit()
    await session.refresh(db_group)

    public_group = PublicGroup.from_orm(db_group)

    response = GroupResponse(status=True, more_available=False, groups=[public_group])
    return response


## Resources ##


@router.get("/resources", response_model=ResourceResponse)
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


@router.post("/resources", response_model=ResourceResponse)
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
