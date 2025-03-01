from typing import Annotated, Optional

from fastapi import APIRouter, Query
from sqlmodel import select

from sqlalchemy.orm import selectinload

from app.db.session import SessionDep
from app.models.models import (
    CreateUser,
    UpdateUser,
    DBUser,
    PublicUser,
    PublicUserWithOrg,
    UserResponse,
    CreateOrg,
    DBOrg,
    PublicOrg,
    PublicOrgWithUsers,
    UpdateOrg,
    OrgResponse,
    CreateCollection,
    DBCollection,
    PublicCollection,
    UpdateCollection,
    CollectionResponse,
    CreateGroup,
    DBGroup,
    PublicGroup,
    UpdateGroup,
    GroupResponse,
    CreateResource,
    DBResource,
    PublicResource,
    ResourceResponse,
    Response,
)

users_router = APIRouter(prefix="/users", tags=["Users"])


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

    public_user = PublicUser.from_orm(db_user)

    response = UserResponse(status=True, more_available=False, users=[public_user])
    return response

@users_router.delete("/{user_id}", response_model=Response[None])
async def delete_user(
    session: SessionDep,
    user_id: int
) -> Response[None]:
    db_user = await session.get(DBUser, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.sqlmodel_update({"active": False})
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    return Response(status=True, more_available=False, items=[])

@users_router.patch("/{user_id}", response_model=Response[PublicUserWithOrg])
async def update_user(
    session: SessionDep,
    user_id: int,
    user: UpdateUser
) -> Response[PublicUserWithOrg]:
    # db_user = await session.get(DBUser, user_id)
    query = select(DBUser).where(DBUser.id == user_id).options(selectinload(DBUser.org))
    result = await session.execute(query)
    db_user: DBUser | None = result.scalar_one_or_none()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user.model_dump(exclude_unset=True)
    db_user.sqlmodel_update(user_data)

    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    public_user = PublicUserWithOrg.from_orm(db_user)

    return Response(status=True, more_available=False, items=[public_user])


## Organizations ##


orgs_router = APIRouter(prefix="/orgs", tags=["Organizations"])


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


@orgs_router.get("/{org_id}", response_model=Response[PublicOrgWithUsers])
async def get_one_org(
    session: SessionDep,
    org_id: int
) -> Response[PublicOrgWithUsers]:
    query = select(DBOrg).where(DBOrg.id == org_id).where(DBOrg.active).options(selectinload(DBOrg.users))
    result = await session.execute(query)
    org: PublicOrgWithUsers = result.scalars().one()
    response = Response(status=True, more_available=False, items=[org])
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


@orgs_router.delete("/{org_id}", response_model=Response[None])
async def delete_org(
    session: SessionDep,
    org_id: int
) -> Response[None]:
    db_org = await session.get(DBOrg, org_id)
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")

    db_org.sqlmodel_update({"active": False})
    session.add(db_org)
    await session.commit()
    await session.refresh(db_org)

    return Response(status=True, more_available=False, items=[])


@orgs_router.patch("/{org_id}", response_model=Response[PublicOrgWithUsers])
async def update_org(
    session: SessionDep,
    org_id: int,
    org: UpdateOrg
) -> Response[PublicOrgWithUsers]:
    query = select(DBOrg).where(DBOrg.id == org_id).options(selectinload(DBOrg.users))
    result = await session.execute(query)
    db_org: DBOrg | None = result.scalar_one_or_none()

    if not db_org:
        raise HTTPException(status_code=404, detail="Org not found")

    org_data = org.model_dump(exclude_unset=True)
    db_org.sqlmodel_update(org_data)

    session.add(db_org)
    await session.commit()
    await session.refresh(db_org)

    public_org = PublicOrgWithUsers.from_orm(db_org)

    return Response(status=True, more_available=False, items=[public_org])



# Collections

collections_router = APIRouter(prefix="/collections", tags=["Collections"])


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


@collections_router.get("/{collection_id}", response_model=Response[PublicCollection])
async def get_one_collection(
    session: SessionDep,
    collection_id: int
) -> Response[PublicCollection]:
    query = select(DBCollection).where(DBCollection.id == collection_id).where(DBCollection.active)
    result = await session.execute(query)
    collection: PublicCollection = result.scalars().one()
    response = Response(status=True, more_available=False, items=[collection])
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


@collections_router.delete("/{collection_id}", response_model=Response[None])
async def delete_collection(
    session: SessionDep,
    collection_id: int
) -> Response[None]:
    db_collection = await session.get(DBCollection, collection_id)
    if not db_collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    db_collection.sqlmodel_update({"active": False})
    session.add(db_collection)
    await session.commit()
    await session.refresh(db_collection)

    return Response(status=True, more_available=False, items=[])


@collections_router.patch("/{collection_id}", response_model=Response[PublicCollection])
async def update_collection(
    session: SessionDep,
    collection_id: int,
    collection: UpdateCollection
) -> Response[PublicCollection]:
    query = select(DBCollection).where(DBCollection.id == collection_id)
    result = await session.execute(query)
    db_collection: DBCollection | None = result.scalar_one_or_none()

    if not db_collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    collection_data = collection.model_dump(exclude_unset=True)
    db_collection.sqlmodel_update(collection_data)

    session.add(db_collection)
    await session.commit()
    await session.refresh(db_collection)

    public_collection = PublicCollection.from_orm(db_collection)

    return Response(status=True, more_available=False, items=[public_collection])


## Groups ##


groups_router = APIRouter(prefix="/groups", tags=["Groups"])


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


@groups_router.get("/{group_id}", response_model=Response[PublicGroup])
async def get_one_group(
    session: SessionDep,
    group_id: int
) -> Response[PublicGroup]:
    query = select(DBGroup).where(DBGroup.id == group_id).where(DBGroup.active)
    result = await session.execute(query)
    group: PublicGroup = result.scalars().one()
    response = Response(status=True, more_available=False, items=[group])
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

@groups_router.delete("/{group_id}", response_model=Response[None])
async def delete_group(
    session: SessionDep,
    group_id: int
) -> Response[None]:
    db_group = await session.get(DBGroup, group_id)
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")

    db_group.sqlmodel_update({"active": False})
    session.add(db_group)
    await session.commit()
    await session.refresh(db_group)

    return Response(status=True, more_available=False, items=[])


@groups_router.patch("/{group_id}", response_model=Response[PublicGroup])
async def update_group(
    session: SessionDep,
    group_id: int,
    group: UpdateGroup
) -> Response[PublicGroup]:
    query = select(DBGroup).where(DBGroup.id == group_id)
    result = await session.execute(query)
    db_group: DBGroup | None = result.scalar_one_or_none()

    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")

    group_data = group.model_dump(exclude_unset=True)
    db_group.sqlmodel_update(group_data)

    session.add(db_group)
    await session.commit()
    await session.refresh(db_group)

    public_group = PublicGroup.from_orm(db_group)

    return Response(status=True, more_available=False, items=[public_group])



## Resources ##

resources_router = APIRouter(prefix="/resources", tags=["Resources"])


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
