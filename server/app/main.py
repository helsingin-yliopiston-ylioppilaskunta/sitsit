from fastapi import FastAPI

from app.db.database import engine
from app.api.endpoints import users_router
from app.api.endpoints import orgs_router
from app.api.endpoints import collections_router
from app.api.endpoints import groups_router
from app.api.endpoints import resources_router

from sqlmodel import SQLModel

app = FastAPI()


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


@app.get("/")
async def root():
    return {"status": "ok"}


app.include_router(users_router)
app.include_router(orgs_router)
app.include_router(collections_router)
app.include_router(groups_router)
app.include_router(resources_router)
