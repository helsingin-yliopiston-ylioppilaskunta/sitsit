from typing import Annotated

from fastapi import Depends
from sqlmodel import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import engine


async def get_session():
    async with AsyncSession(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
