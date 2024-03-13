from fastapi import APIRouter, Depends, HTTPException, Query, Body
from pymongo import UpdateOne
from pymongo.errors import BulkWriteError

from typing import Optional, Dict, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from bson import ObjectId

from ..db import get_db


class AuthorInfo(BaseModel):
    id: str
    name: str
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None


class TicketResolveRequest(BaseModel):
    reply_to_message_id: str
    content: str
    msg_url: str
    author: AuthorInfo


router = APIRouter(
    prefix="/tickets",
    tags=["tickets"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def get_filtered_data(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, le=100),
    author: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    flagged: Optional[bool] = Query(None),
    query: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db=Depends(get_db),
):
    """
    Retrieves a list of tickets with optional filters.
    """
    if any([author, channel, query]):
        result = await fetch_data_with_join(
            db, query, flagged, status, channel, author, page, size
        )
    else:
        result = await fetch_data_without_join(db, flagged, status, page, size)
    return result


@router.get("/authors")
async def get_distinct_authors(db=Depends(get_db)):
    """
    Retrieves a list of distinct authors from the messages associated with tickets.
    """
    pipeline = [
        {
            "$lookup": {
                "from": "messages",
                "localField": "msg_id",
                "foreignField": "_id",
                "as": "ticket_messages",
            }
        },
        {"$unwind": "$ticket_messages"},
        {
            "$group": {
                "_id": None,
                "distinct_authors": {"$addToSet": "$ticket_messages.author"},
            }
        },
    ]
    result = await db.tickets.aggregate(pipeline).to_list(None)
    return result[0]["distinct_authors"] if result else []


@router.get("/channels", response_model=List[str])
async def get_distinct_channels(db=Depends(get_db)):
    """
    Retrieves a list of distinct channel IDs from the tickets collection.
    """
    pipeline = [
        {
            "$lookup": {
                "from": "messages",
                "localField": "msg_id",
                "foreignField": "_id",
                "as": "message",
            }
        },
        {"$unwind": "$message"},
        {"$group": {"_id": "$message.channel_id"}},
        {"$project": {"_id": 0, "channel_id": "$_id"}},
    ]

    result = await db.tickets.aggregate(pipeline).to_list(None)

    distinct_channels = [item["channel_id"] for item in result]
    return distinct_channels


@router.get("/{ticket_id}", response_model=Dict)
async def get_ticket_with_messages(ticket_id: str, db=Depends(get_db)):
    """
    Retrieves a ticket by its ID along with its associated messages.
    """
    ticket = await fetch_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")

    messages = await fetch_messages(db, ticket)
    await attach_reference_messages(db, messages)

    ticket["messages"] = messages
    return ticket


@router.patch("/flag")
async def update_flagged_tickets(
    ticket_ids: List[str] = Body(..., embed=True),
    flagged: bool = Body(..., embed=True),
    db=Depends(get_db),
):
    """
    Flags or unflags a list of tickets by setting the `flagged` field to the provided value.
    """
    if not ticket_ids:
        raise HTTPException(status_code=400, detail="No ticket IDs provided.")

    operations = [
        UpdateOne({"_id": ticket_id}, {"$set": {"flagged": flagged}})
        for ticket_id in ticket_ids
    ]

    try:
        result = await db.tickets.bulk_write(operations)
    except Exception as e:
        print(f"Error updating tickets: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    return {
        "matched_count": result.matched_count,
        "modified_count": result.modified_count,
    }


@router.patch("/close")
async def close_tickets(
    ticket_ids: List[str] = Body(...),
    db=Depends(get_db),
):
    """
    Closes a list of tickets by setting their status to "closed" and updating the timestamp of the last status change.
    """
    if not ticket_ids:
        raise HTTPException(status_code=400, detail="No ticket IDs provided.")

    current_time = datetime.now(timezone.utc)
    operations = [
        UpdateOne(
            {"_id": ticket_id},
            {"$set": {"status": "closed", "ts_last_status_change": current_time}},
        )
        for ticket_id in ticket_ids
    ]

    try:
        result = await db.tickets.bulk_write(operations)
    except Exception as e:
        print(f"Error closing tickets: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    return {
        "matched_count": result.matched_count,
        "modified_count": result.modified_count,
    }


@router.patch("/open")
async def open_tickets(
    ticket_ids: List[str] = Body(...),
    db=Depends(get_db),
):
    """
    Opens a list of tickets by setting their status to "open" and updating the timestamp of the last status change.
    """
    if not ticket_ids:
        raise HTTPException(status_code=400, detail="No ticket IDs provided.")

    current_time = datetime.now(timezone.utc)
    try:
        operations = [
            UpdateOne(
                {"_id": ticket_id},
                {"$set": {"status": "open", "ts_last_status_change": current_time}},
            )
            for ticket_id in ticket_ids
        ]

        result = await db.tickets.bulk_write(operations)
    except BulkWriteError as bwe:
        print(f"Bulk write error: {bwe.details}")
        raise HTTPException(status_code=400, detail="Error processing bulk update")
    except Exception as e:
        print(f"Error updating tickets: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    return {
        "matched_count": result.matched_count,
        "modified_count": result.modified_count,
    }


@router.post("/{ticket_id}/resolve", response_model=Dict[str, int])
async def resolve_ticket(
    ticket_id: str,
    request: TicketResolveRequest,
    db=Depends(get_db),
):
    """
    Resolves a ticket by setting its status to "resolved" and adding a new message to the context.
    """
    original_message = await db.messages.find_one({"_id": request.reply_to_message_id})
    if not original_message:
        raise HTTPException(status_code=404, detail="Original message not found.")

    new_message_id = await add_reply_message(db, original_message, request)
    ticket_update_result = await update_ticket_status(
        db, ticket_id, new_message_id, request.author.id
    )

    return {
        "matched_count": ticket_update_result.matched_count,
        "modified_count": ticket_update_result.modified_count,
    }


@router.put("/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    ticket_data: Dict,
    db=Depends(get_db),
):
    """
    Updates a ticket identified by its ID.
    """

    if ticket_data.get("status"):
        ticket_data["ts_last_status_change"] = datetime.now(timezone.utc)

    result = await db.tickets.update_one({"_id": ticket_id}, {"$set": ticket_data})

    return {"_id": ticket_id, "modified_count": result.modified_count}


async def fetch_data_with_join(db, query, flagged, status, channel, author, page, size):
    pipeline = build_base_pipeline(flagged, status)
    extend_pipeline_for_join(pipeline, query, author, channel)
    extend_pipeline_for_pagination(pipeline, page, size)
    return await aggregate_data(db, pipeline, page, size)


async def fetch_data_without_join(db, flagged, status, page, size):
    pipeline = build_base_pipeline(flagged, status)
    extend_pipeline_for_pagination(pipeline, page, size)
    data = await aggregate_data(db, pipeline, page, size)
    return await attach_messages_to_tickets(db, data)


def build_base_pipeline(flagged, status):
    pipeline = []
    if flagged is not None:
        pipeline.append({"$match": {"flagged": flagged}})
    if status:
        pipeline.append({"$match": {"status": status}})
    return pipeline


def extend_pipeline_for_join(pipeline, query, author, channel):
    pipeline.append(
        {
            "$lookup": {
                "from": "messages",
                "localField": "msg_id",
                "foreignField": "_id",
                "as": "message",
            }
        }
    )
    pipeline.append({"$unwind": "$message"})
    if author:
        pipeline.append({"$match": {"message.author.name": author}})
    if channel:
        pipeline.append({"$match": {"message.channel_id": channel}})
    if query:
        content_condition = {"message.content": {"$regex": query, "$options": "i"}}
        author_condition = {"message.author.name": {"$regex": query, "$options": "i"}}
        pipeline.append({"$match": {"$or": [content_condition, author_condition]}})


def extend_pipeline_for_pagination(pipeline, page, size):
    pipeline.extend(
        [
            {"$sort": {"timestamp": -1}},
            {"$skip": (page - 1) * size},
            {"$limit": size},
        ]
    )


async def aggregate_data(db, pipeline, page, size):
    data = await db.tickets.aggregate(pipeline).to_list(length=None)
    count_pipeline = pipeline[:-3] + [{"$count": "total_count"}]
    count_result = await db.tickets.aggregate(count_pipeline).to_list(length=None)
    total_count = count_result[0]["total_count"] if count_result else 0
    return {"total_count": total_count, "data": data}


async def attach_messages_to_tickets(db, ticket_data):
    msg_ids = [ticket.get("msg_id") for ticket in ticket_data["data"]]
    messages_cursor = db.messages.find({"_id": {"$in": msg_ids}})
    messages = await messages_cursor.to_list(None)
    for ticket in ticket_data["data"]:
        ticket["message"] = next(
            (msg for msg in messages if msg["_id"] == ticket["msg_id"]), None
        )
    return ticket_data


async def fetch_ticket(db, ticket_id):
    """
    Fetches a single ticket by its ID.
    """
    return await db.tickets.find_one({"_id": ticket_id})


async def fetch_messages(db, ticket):
    """
    Fetches messages associated with the ticket, including context messages.
    """
    message_ids = set([ticket.get("msg_id")] + ticket.get("context_messages", []))
    message_ids.discard(None)  # Remove any None values that may have been added

    messages_cursor = db.messages.find({"_id": {"$in": list(message_ids)}}).sort(
        "timestamp", 1
    )
    return await messages_cursor.to_list(None)


async def attach_reference_messages(db, messages):
    """
    Attaches reference messages to the primary messages list if any message has a reference.
    """
    # Extract reference message IDs and discard None values
    reference_msg_ids = {
        msg.get("reference_msg_id") for msg in messages if msg.get("reference_msg_id")
    }

    print(f"Reference message IDs: {reference_msg_ids}")

    if not reference_msg_ids:
        return  # If there are no reference messages, exit the function

    # Fetch reference messages based on their IDs
    reference_messages_cursor = db.messages.find(
        {"_id": {"$in": list(reference_msg_ids)}}
    )
    reference_messages = await reference_messages_cursor.to_list(None)

    # Create a mapping of reference message IDs to message objects for quick lookup
    reference_messages_map = {msg["_id"]: msg for msg in reference_messages}

    # Attach reference messages where applicable
    for msg in messages:
        ref_msg_id = msg.get("reference_msg_id")
        if ref_msg_id and ref_msg_id in reference_messages_map:
            # Add the reference message to the 'reference_msg' field
            msg["reference_msg"] = reference_messages_map[ref_msg_id]


async def add_reply_message(db, original_message, request):
    """
    Adds a reply message based on the original message and the request details.
    """
    new_message = {
        "_id": str(ObjectId()),
        "channel_id": original_message["channel_id"],
        "parent_channel_id": original_message.get("parent_channel_id"),
        "community_server_id": original_message["community_server_id"],
        "timestamp": datetime.utcnow().isoformat(),
        "reference_msg_id": request.reply_to_message_id,
        "author_id": request.author.id,
        "content": request.content,
        "msg_url": request.msg_url,
        "discussion_id": original_message.get("discussion_id"),
        "author": request.author.dict(),
    }
    result = await db.messages.insert_one(new_message)
    return str(result.inserted_id)


async def update_ticket_status(db, ticket_id, new_message_id, author_id):
    """
    Updates the ticket's status to "resolved" and appends the new message to its context.
    """
    return await db.tickets.update_one(
        {"_id": ticket_id},
        {
            "$set": {
                "status": "resolved",
                "resolved_by": author_id,
                "ts_last_status_change": datetime.now(timezone.utc),
            },
            "$push": {"context_messages": new_message_id},
        },
    )
