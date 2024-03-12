from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends
import logging

logger = logging.getLogger(__name__)

from .config.config import (
    MONGODB_URL,
    MONGODB_DB,
    MAX_CONNECTIONS_COUNT,
    MIN_CONNECTIONS_COUNT,
)

client = AsyncIOMotorClient(
    str(MONGODB_URL),
    maxPoolSize=MAX_CONNECTIONS_COUNT,
    minPoolSize=MIN_CONNECTIONS_COUNT,
)

db = client[MONGODB_DB]


def get_db():
    return db
