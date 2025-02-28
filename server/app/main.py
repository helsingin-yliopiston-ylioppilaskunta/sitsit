from fastapi import FastAPI, APIRouter

from app.db.database import engine
from app.api.endpoints import users_router
from app.api.endpoints import orgs_router
from app.api.endpoints import collections_router
from app.api.endpoints import groups_router
from app.api.endpoints import resources_router

from sqlmodel import SQLModel

tags_metadata = [
    {
        "name": "Users",
        "description": "Operations related to user management"
    },
    {
        "name": "Status",
        "description": "Get the status of the API"
    },
    {
        "name": "Organizations",
        "description": "Operations related to organization management"
    },
    {
        "name": "Collections",
        "description": "Operations related to management of collections"
    },
    {
        "name": "Groups",
        "description": "Operations related to management of groups"
    },
    {
        "name": "Resources",
        "description": "Operations related to management of resources"
    }
]

app = FastAPI(
    title="Sitsit",
    openapi_tags=tags_metadata,
    description="Sitsit API"
)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


status_router = APIRouter(tags=["Status"])
@status_router.get("/")
async def status():
    return {"status": "ok"}


app.include_router(status_router)
app.include_router(users_router)
app.include_router(orgs_router)
app.include_router(collections_router)
app.include_router(groups_router)
app.include_router(resources_router)
