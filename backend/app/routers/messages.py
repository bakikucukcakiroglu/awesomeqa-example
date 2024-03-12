from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from ..db import get_db
from ..models.messages import Message
from bson import ObjectId

router = APIRouter(
    prefix="/messages",
    tags=["messages"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def get_messages(db=Depends(get_db)):
    messages = await db.find().to_list()
    return messages


@router.get("/{message_id}")
async def get_message_by_id(message_id: str, db=Depends(get_db)):
    message = await db.messages.find_one({"_id": message_id})
    if message:
        return message
    raise HTTPException(status_code=404, detail="Message not found")


@router.get("/channels")
async def get_ticket_channels(db=Depends(get_db)):
    channels = await db.messages.distinct("channel_id")
    return channels


@router.post("/")
async def create_message(message_data: Message, db=Depends(get_db)):
    message_dict = message_data.dict()
    await db.messages.insert_one(message_dict)
    return message_dict
