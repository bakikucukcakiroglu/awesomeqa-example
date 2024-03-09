from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from .messages import Message


class TicketBase(BaseModel):
    msg_id: str
    message: Optional[Message]  # Embedded message object
    status: str
    resolved_by: Optional[str] = None
    ts_last_status_change: Optional[datetime] = None
    timestamp: datetime
    context_messages: List[str]


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    resolved_by: Optional[str] = None
    ts_last_status_change: Optional[datetime] = None


class TicketInDB(TicketBase):
    _id: uuid.UUID = Field(default_factory=uuid.uuid4)
