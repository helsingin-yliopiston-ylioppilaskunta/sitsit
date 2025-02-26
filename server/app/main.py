from fastapi import FastAPI

from sqlalchemy.ext.asyncio import AsyncSession
from .db.database import engine, Base, SessionLocal

app = FastAPI()


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with SessionLocal() as session:
        yield session


@app.get("/")
async def root():
    return {"message": "Hello World"}
