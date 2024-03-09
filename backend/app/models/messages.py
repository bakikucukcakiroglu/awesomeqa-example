from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Author(BaseModel):
    id: str
    name: str
    nickname: str
    color: str
    discriminator: str
    avatar_url: str
    is_bot: bool
    timestamp_insert: datetime


class Message(BaseModel):
    _id: str
    channel_id: str
    parent_channel_id: Optional[str] = None
    community_server_id: str
    timestamp: datetime
    has_attachment: bool
    reference_msg_id: Optional[str] = None
    timestamp_insert: datetime
    discussion_id: str
    author_id: str
    content: str
    msg_url: str
    author: Author
