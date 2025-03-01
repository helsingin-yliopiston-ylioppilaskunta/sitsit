from typing import Annotated, Optional

from fastapi import APIRouter, Query, HTTPException
from sqlmodel import select

from sqlalchemy.orm import selectinload

from app.db.session import SessionDep
from app.models.models import (
    CreateUser,
    UpdateUser,
    DBUser,
    PublicUser,
    PublicUserWithOrg,
)

from app.models.models import (
    CreateOrg,
    DBOrg,
    PublicOrg,
    PublicOrgWithUsers,
    UpdateOrg,
)

from app.models.models import (
    CreateCollection,
    DBCollection,
    PublicCollection,
    PublicCollectionWithGroups,
    UpdateCollection,
)

from app.models.models import (
    CreateGroup,
    DBGroup,
    PublicGroup,
    PublicGroupWithCollection,
    UpdateGroup,
)

from app.models.models import (
    CreateResource,
    DBResource,
    PublicResource,
    UpdateResource,
)

from app.models.models import (
    CreateResourceType,
    DBResourceType,
    PublicResourceType,
    UpdateResourceType,
)

from app.models.models import (
    CreateReservation,
    DBReservation,
    PublicReservation,
    UpdateReservation,
)

from app.models.models import (
    CreateReservationTime,
    DBReservationTime,
    PublicReservationTime,
    UpdateReservationTime,
)

from app.models.models import (
    CreateReservationResource,
    DBReservationResource,
    PublicReservationResource,
    UpdateReservationResource,
)

from app.models.models import (
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
    session: SessionDep, user_id: int
) -> Response[PublicUserWithOrg]:
    query = (
        select(DBUser)
        .where(DBUser.id == user_id)
        .where(DBUser.active)
        .options(selectinload(DBUser.org))
    )
    result = await session.execute(query)
    user: PublicUserWithOrg = result.scalars().one()
    response = Response(status=True, more_available=False, items=[user])
    return response


@users_router.post("/", response_model=Response[PublicUser])
async def create_user(session: SessionDep, user: CreateUser):
    db_user = DBUser(username=user.username, hash=user.hash, org_id=user.org_id)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    public_user = PublicUser.from_orm(db_user)

    response = Response(status=True, more_available=False, items=[public_user])
    return response


@users_router.delete("/{user_id}", response_model=Response[None])
async def delete_user(session: SessionDep, user_id: int) -> Response[None]:
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
    session: SessionDep, user_id: int, user: UpdateUser
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


@orgs_router.get("/", response_model=Response[PublicOrg])
async def read_orgs(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicOrg]:
    query = select(DBOrg).where(DBOrg.active).options(selectinload(DBOrg.users))
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    orgs: list[PublicOrgWithUsers] = result.scalars().all()

    more_available = len(orgs) > limit

    response = Response(status=True, more_available=more_available, items=orgs)

    return response


@orgs_router.get("/{org_id}", response_model=Response[PublicOrgWithUsers])
async def get_one_org(session: SessionDep, org_id: int) -> Response[PublicOrgWithUsers]:
    query = (
        select(DBOrg)
        .where(DBOrg.id == org_id)
        .where(DBOrg.active)
        .options(selectinload(DBOrg.users))
    )
    result = await session.execute(query)
    org: PublicOrgWithUsers = result.scalars().one()
    response = Response(status=True, more_available=False, items=[org])
    return response


@orgs_router.post("/", response_model=Response[PublicOrg])
async def create_org(session: SessionDep, org: CreateOrg):
    db_org = DBOrg(name=org.name)
    session.add(db_org)
    await session.commit()
    await session.refresh(db_org)

    public_org = PublicOrg.from_orm(db_org)

    response = Response[PublicOrg](
        status=True, more_available=False, items=[public_org]
    )
    return response


@orgs_router.delete("/{org_id}", response_model=Response[None])
async def delete_org(session: SessionDep, org_id: int) -> Response[None]:
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
    session: SessionDep, org_id: int, org: UpdateOrg
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


@collections_router.get("/", response_model=Response[PublicCollectionWithGroups])
async def read_collections(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicCollectionWithGroups]:
    query = (
        select(DBCollection)
        .where(DBCollection.active)
        .options(selectinload(DBCollection.groups))
    )
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    collections: list[PublicCollectionWithGroups] = result.scalars().all()

    print(collections)

    more_available = len(collections) > limit

    response = Response[PublicCollectionWithGroups](
        status=True, more_available=more_available, items=collections
    )

    return response


@collections_router.get(
    "/{collection_id}", response_model=Response[PublicCollectionWithGroups]
)
async def get_one_collection(
    session: SessionDep, collection_id: int
) -> Response[PublicCollectionWithGroups]:
    query = (
        select(DBCollection)
        .where(DBCollection.id == collection_id)
        .where(DBCollection.active)
    )
    result = await session.execute(query)
    collection: PublicCollectionWithGroups = result.scalars().one()
    response = Response(status=True, more_available=False, items=[collection])
    return response


@collections_router.post("/", response_model=Response[PublicCollection])
async def create_collection(session: SessionDep, org: CreateCollection):
    db_collection = DBCollection(name=org.name)
    session.add(db_collection)
    await session.commit()
    await session.refresh(db_collection)

    public_collection = PublicCollection.from_orm(db_collection)

    response = Response[PublicCollection](
        status=True, more_available=False, items=[public_collection]
    )
    return response


@collections_router.delete("/{collection_id}", response_model=Response[None])
async def delete_collection(session: SessionDep, collection_id: int) -> Response[None]:
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
    session: SessionDep, collection_id: int, collection: UpdateCollection
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


@groups_router.get("/", response_model=Response[PublicGroupWithCollection])
async def read_groups(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicGroupWithCollection]:
    query = (
        select(DBGroup).where(DBGroup.active).options(selectinload(DBGroup.collection))
    )
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    groups: list[PublicGroupWithCollection] = result.scalars().all()

    print(groups)

    more_available = len(groups) > limit

    response = Response(status=True, more_available=more_available, items=groups)

    return response


@groups_router.get("/{group_id}", response_model=Response[PublicGroup])
async def get_one_group(session: SessionDep, group_id: int) -> Response[PublicGroup]:
    query = select(DBGroup).where(DBGroup.id == group_id).where(DBGroup.active)
    result = await session.execute(query)
    group: PublicGroup = result.scalars().one()
    response = Response(status=True, more_available=False, items=[group])
    return response


@groups_router.post("/", response_model=Response[PublicGroup])
async def create_group(session: SessionDep, group: CreateGroup):
    db_group = DBGroup(name=group.name, collection_id=group.collection_id)
    session.add(db_group)
    await session.commit()
    await session.refresh(db_group)

    public_group = PublicGroup.from_orm(db_group)

    response = Response[PublicGroup](
        status=True, more_available=False, items=[public_group]
    )
    return response


@groups_router.delete("/{group_id}", response_model=Response[None])
async def delete_group(session: SessionDep, group_id: int) -> Response[None]:
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
    session: SessionDep, group_id: int, group: UpdateGroup
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


@resources_router.get("/", response_model=Response[PublicResource])
async def read_resources(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicResource]:
    query = select(DBResource).where(DBResource.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    resources: list[PublicResource] = result.scalars().all()

    print(resources)

    more_available = len(resources) > limit

    response = Response[PublicResource](
        status=True, more_available=more_available, items=resources
    )

    return response


@resources_router.get("/{resource_id}", response_model=Response[PublicResource])
async def get_one_resource(
    session: SessionDep, resource_id: int
) -> Response[PublicResource]:
    query = (
        select(DBResource).where(DBResource.id == resource_id).where(DBResource.active)
    )
    result = await session.execute(query)
    resource: PublicResource = result.scalars().one()
    response = Response(status=True, more_available=False, items=[resource])
    return response


@resources_router.post("/", response_model=Response[PublicResource])
async def create_resource(session: SessionDep, org: CreateResource):
    db_resource = DBResource(
        name=org.name, group_id=org.group_id, resource_type_id=org.resource_type_id
    )
    session.add(db_resource)
    await session.commit()
    await session.refresh(db_resource)

    public_resource = PublicResource.from_orm(db_resource)

    response = Response[PublicResource](
        status=True, more_available=False, items=[public_resource]
    )
    return response


@resources_router.delete("/{resource_id}", response_model=Response[None])
async def delete_resource(session: SessionDep, resource_id: int) -> Response[None]:
    db_resource = await session.get(DBResource, resource_id)
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    db_resource.sqlmodel_update({"active": False})
    session.add(db_resource)
    await session.commit()
    await session.refresh(db_resource)

    return Response(status=True, more_available=False, items=[])


@resources_router.patch("/{resource_id}", response_model=Response[PublicResource])
async def update_resource(
    session: SessionDep, resource_id: int, resource: UpdateResource
) -> Response[PublicResource]:
    query = select(DBResource).where(DBResource.id == resource_id)
    result = await session.execute(query)
    db_resource: DBResource | None = result.scalar_one_or_none()

    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    resource_data = resource.model_dump(exclude_unset=True)
    db_resource.sqlmodel_update(resource_data)

    session.add(db_resource)
    await session.commit()
    await session.refresh(db_resource)

    public_resource = PublicResource.from_orm(db_resource)

    return Response(status=True, more_available=False, items=[public_resource])


## ResourceTypes ##


resourcetypes_router = APIRouter(prefix="/resourcetypes", tags=["ResourceTypes"])


@resourcetypes_router.get("/", response_model=Response[PublicResourceType])
async def read_resourceTypes(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicResourceType]:
    query = select(DBResourceType).where(DBResourceType.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    resourceTypes: list[PublicResourceType] = result.scalars().all()

    more_available = len(resourceTypes) > limit

    response = Response(status=True, more_available=more_available, items=resourceTypes)

    return response


@resourcetypes_router.get(
    "/{resourceType_id}", response_model=Response[PublicResourceType]
)
async def get_one_resourceType(
    session: SessionDep, resourceType_id: int
) -> Response[PublicResourceType]:
    query = (
        select(DBResourceType)
        .where(DBResourceType.id == resourceType_id)
        .where(DBResourceType.active)
    )
    result = await session.execute(query)
    resourceType: PublicResourceType = result.scalars().one()
    response = Response(status=True, more_available=False, items=[resourceType])
    return response


@resourcetypes_router.post("/", response_model=Response[PublicResourceType])
async def create_resourceType(session: SessionDep, resourcetype: CreateResourceType):
    db_resourceType = DBResourceType(name=resourcetype.name)
    session.add(db_resourceType)
    await session.commit()
    await session.refresh(db_resourceType)

    public_resourceType = PublicResourceType.from_orm(db_resourceType)

    response = Response(status=True, more_available=False, items=[public_resourceType])
    return response


@resourcetypes_router.delete("/{resourceType_id}", response_model=Response[None])
async def delete_resourceType(
    session: SessionDep, resourceType_id: int
) -> Response[None]:
    db_resourceType = await session.get(DBResourceType, resourceType_id)
    if not db_resourceType:
        raise HTTPException(status_code=404, detail="ResourceType not found")

    db_resourceType.sqlmodel_update({"active": False})
    session.add(db_resourceType)
    await session.commit()
    await session.refresh(db_resourceType)

    return Response(status=True, more_available=False, items=[])


@resourcetypes_router.patch(
    "/{resourceType_id}", response_model=Response[PublicResourceType]
)
async def update_resourceType(
    session: SessionDep, resourceType_id: int, resourceType: UpdateResourceType
) -> Response[PublicResourceType]:
    query = select(DBResourceType).where(DBResourceType.id == resourceType_id)
    result = await session.execute(query)
    db_resourceType: DBResourceType | None = result.scalar_one_or_none()

    if not db_resourceType:
        raise HTTPException(status_code=404, detail="ResourceType not found")

    resourceType_data = resourceType.model_dump(exclude_unset=True)
    db_resourceType.sqlmodel_update(resourceType_data)

    session.add(db_resourceType)
    await session.commit()
    await session.refresh(db_resourceType)

    public_resourceType = PublicResourceType.from_orm(db_resourceType)

    return Response(status=True, more_available=False, items=[public_resourceType])


## Reservations ##


reservations_router = APIRouter(prefix="/reservations", tags=["Reservations"])


@reservations_router.get("/", response_model=Response[PublicReservation])
async def read_reservations(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicReservation]:
    query = select(DBReservation).where(DBReservation.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    reservations: list[PublicReservation] = result.scalars().all()

    more_available = len(reservations) > limit

    response = Response(status=True, more_available=more_available, items=reservations)

    return response


@reservations_router.get(
    "/{reservation_id}", response_model=Response[PublicReservation]
)
async def get_one_reservation(
    session: SessionDep, reservation_id: int
) -> Response[PublicReservation]:
    query = (
        select(DBReservation)
        .where(DBReservation.id == reservation_id)
        .where(DBReservation.active)
    )
    result = await session.execute(query)
    reservation: PublicReservation = result.scalars().one()
    response = Response(status=True, more_available=False, items=[reservation])
    return response


@reservations_router.post("/", response_model=Response[PublicReservation])
async def create_reservation(session: SessionDep, reservation: CreateReservation):
    db_reservation = DBReservation(
        name=reservation.name,
        user_id=reservation.user_id,
        contact_info=reservation.contact_info,
        description=reservation.description,
    )
    session.add(db_reservation)
    await session.commit()
    await session.refresh(db_reservation)

    public_reservation = PublicReservation.from_orm(db_reservation)

    response = Response(status=True, more_available=False, items=[public_reservation])
    return response


@reservations_router.delete("/{reservation_id}", response_model=Response[None])
async def delete_reservation(
    session: SessionDep, reservation_id: int
) -> Response[None]:
    db_reservation = await session.get(DBReservation, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    db_reservation.sqlmodel_update({"active": False})
    session.add(db_reservation)
    await session.commit()
    await session.refresh(db_reservation)

    return Response(status=True, more_available=False, items=[])


@reservations_router.patch(
    "/{reservation_id}", response_model=Response[PublicReservation]
)
async def update_reservation(
    session: SessionDep, reservation_id: int, reservation: UpdateReservation
) -> Response[PublicReservation]:
    query = select(DBReservation).where(DBReservation.id == reservation_id)
    result = await session.execute(query)
    db_reservation: DBReservation | None = result.scalar_one_or_none()

    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    reservation_data = reservation.model_dump(exclude_unset=True)
    db_reservation.sqlmodel_update(reservation_data)

    session.add(db_reservation)
    await session.commit()
    await session.refresh(db_reservation)

    public_reservation = PublicReservation.from_orm(db_reservation)

    return Response(status=True, more_available=False, items=[public_reservation])


## ReservationTimes ##


reservationtimes_router = APIRouter(
    prefix="/reservationTimes", tags=["ReservationTimes"]
)


@reservationtimes_router.get("/", response_model=Response[PublicReservationTime])
async def read_reservationTimes(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicReservationTime]:
    query = select(DBReservationTime).where(DBReservationTime.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    reservationTimes: list[PublicReservationTime] = result.scalars().all()

    more_available = len(reservationTimes) > limit

    response = Response(
        status=True, more_available=more_available, items=reservationTimes
    )

    return response


@reservationtimes_router.get(
    "/{reservationTime_id}", response_model=Response[PublicReservationTime]
)
async def get_one_reservationTime(
    session: SessionDep, reservationTime_id: int
) -> Response[PublicReservationTime]:
    query = (
        select(DBReservationTime)
        .where(DBReservationTime.id == reservationTime_id)
        .where(DBReservationTime.active)
    )
    result = await session.execute(query)
    reservationTime: PublicReservationTime = result.scalars().one()
    response = Response(status=True, more_available=False, items=[reservationTime])
    return response


@reservationtimes_router.post("/", response_model=Response[PublicReservationTime])
async def create_reservationTime(
    session: SessionDep, reservationTime: CreateReservationTime
):
    db_reservationTime = DBReservationTime(
        reservation_id=reservationTime.reservation_id,
        timestamp=reservationTime.timestamp,
    )
    session.add(db_reservationTime)
    await session.commit()
    await session.refresh(db_reservationTime)

    public_reservationTime = PublicReservationTime.from_orm(db_reservationTime)

    response = Response(
        status=True, more_available=False, items=[public_reservationTime]
    )
    return response


@reservationtimes_router.delete("/{reservationTime_id}", response_model=Response[None])
async def delete_reservationTime(
    session: SessionDep, reservationTime_id: int
) -> Response[None]:
    db_reservationTime = await session.get(DBReservationTime, reservationTime_id)
    if not db_reservationTime:
        raise HTTPException(status_code=404, detail="ReservationTime not found")

    db_reservationTime.sqlmodel_update({"active": False})
    session.add(db_reservationTime)
    await session.commit()
    await session.refresh(db_reservationTime)

    return Response(status=True, more_available=False, items=[])


@reservationtimes_router.patch(
    "/{reservationTime_id}", response_model=Response[PublicReservationTime]
)
async def update_reservationTime(
    session: SessionDep, reservationTime_id: int, reservationTime: UpdateReservationTime
) -> Response[PublicReservationTime]:
    query = select(DBReservationTime).where(DBReservationTime.id == reservationTime_id)
    result = await session.execute(query)
    db_reservationTime: DBReservationTime | None = result.scalar_one_or_none()

    if not db_reservationTime:
        raise HTTPException(status_code=404, detail="ReservationTime not found")

    reservationTime_data = reservationTime.model_dump(exclude_unset=True)
    db_reservationTime.sqlmodel_update(reservationTime_data)

    session.add(db_reservationTime)
    await session.commit()
    await session.refresh(db_reservationTime)

    public_reservationTime = PublicReservationTime.from_orm(db_reservationTime)

    return Response(status=True, more_available=False, items=[public_reservationTime])


## ReservationResources ##


reservationresources_router = APIRouter(
    prefix="/reservationResources", tags=["ReservationResources"]
)


@reservationresources_router.get(
    "/", response_model=Response[PublicReservationResource]
)
async def read_reservationResources(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicReservationResource]:
    query = select(DBReservationResource).where(DBReservationResource.active)
    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    reservationResources: list[PublicReservationResource] = result.scalars().all()

    more_available = len(reservationResources) > limit

    response = Response(
        status=True, more_available=more_available, items=reservationResources
    )

    return response


@reservationresources_router.get(
    "/{reservationResource_id}", response_model=Response[PublicReservationResource]
)
async def get_one_reservationResource(
    session: SessionDep, reservationResource_id: int
) -> Response[PublicReservationResource]:
    query = (
        select(DBReservationResource)
        .where(DBReservationResource.id == reservationResource_id)
        .where(DBReservationResource.active)
    )
    result = await session.execute(query)
    reservationResource: PublicReservationResource = result.scalars().one()
    response = Response(status=True, more_available=False, items=[reservationResource])
    return response


@reservationresources_router.post(
    "/", response_model=Response[PublicReservationResource]
)
async def create_reservationResource(
    session: SessionDep, reservationResource: CreateReservationResource
):
    db_reservationResource = DBReservationResource(
        reservation_id=reservationResource.reservation_id,
        resource_id=reservationResource.resource_id,
    )
    session.add(db_reservationResource)
    await session.commit()
    await session.refresh(db_reservationResource)

    public_reservationResource = PublicReservationResource.from_orm(
        db_reservationResource
    )

    response = Response(
        status=True, more_available=False, items=[public_reservationResource]
    )
    return response


@reservationresources_router.delete(
    "/{reservationResource_id}", response_model=Response[None]
)
async def delete_reservationResource(
    session: SessionDep, reservationResource_id: int
) -> Response[None]:
    db_reservationResource = await session.get(
        DBReservationResource, reservationResource_id
    )
    if not db_reservationResource:
        raise HTTPException(status_code=404, detail="ReservationResource not found")

    db_reservationResource.sqlmodel_update({"active": False})
    session.add(db_reservationResource)
    await session.commit()
    await session.refresh(db_reservationResource)

    return Response(status=True, more_available=False, items=[])


@reservationresources_router.patch(
    "/{reservationResource_id}", response_model=Response[PublicReservationResource]
)
async def update_reservationResource(
    session: SessionDep,
    reservationResource_id: int,
    reservationResource: UpdateReservationResource,
) -> Response[PublicReservationResource]:
    query = select(DBReservationResource).where(
        DBReservationResource.id == reservationResource_id
    )
    result = await session.execute(query)
    db_reservationResource: DBReservationResource | None = result.scalar_one_or_none()

    if not db_reservationResource:
        raise HTTPException(status_code=404, detail="ReservationResource not found")

    reservationResource_data = reservationResource.model_dump(exclude_unset=True)
    db_reservationResource.sqlmodel_update(reservationResource_data)

    session.add(db_reservationResource)
    await session.commit()
    await session.refresh(db_reservationResource)

    public_reservationResource = PublicReservationResource.from_orm(
        db_reservationResource
    )

    return Response(
        status=True, more_available=False, items=[public_reservationResource]
    )
