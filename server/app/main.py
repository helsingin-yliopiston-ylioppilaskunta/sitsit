from fastapi import FastAPI

from .db.database import engine
from .api.endpoints import router as endpoints_router

from sqlmodel import SQLModel, create_engine

app = FastAPI()


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


@app.get("/")
async def root():
    return {"status": "ok"}


app.include_router(endpoints_router)
