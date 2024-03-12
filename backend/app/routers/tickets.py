from fastapi import APIRouter, Depends, HTTPException, Query, Body
from fastapi.responses import JSONResponse
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
    size: int = Query(default=10, maximum=100),
    author: str = Query(None),
    channel: str = Query(None),
    flagged: bool = Query(None),
    query: str = Query(None),
    status: str = Query(None),
    db=Depends(get_db),
):
    """
    Retrieves a list of tickets with optional filters.
    """

    if author or channel or query:
        result = await get_data_with_join(
            db, query, flagged, status, channel, author, page, size
        )
    else:
        result = await get_data_without_join(db, flagged, status, page, size)

    return result


async def get_data_with_join(db, query, flagged, status, channel, author, page, size):

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
    ]

    if flagged is not None:
        pipeline.append({"$match": {"flagged": flagged}})

    if status:
        pipeline.append({"$match": {"status": status}})

    if author:
        pipeline.append({"$match": {"message.author.name": author}})

    if channel:
        pipeline.append({"$match": {"message.channel_id": channel}})

    if query:
        content_condition = {"message.content": {"$regex": query, "$options": "i"}}
        author_condition = {"message.author.name": {"$regex": query, "$options": "i"}}

        pipeline.append(
            {
                "$match": {
                    "$and": [
                        {"$or": [content_condition, author_condition]},
                    ]
                }
            }
        )

    pipeline.extend(
        [
            {"$sort": {"timestamp": -1}},
            {"$skip": (page - 1) * size},
            {"$limit": size},
        ]
    )

    ticket_data = await db.tickets.aggregate(pipeline).to_list(length=None)

    count_pipeline = pipeline[:-3]
    count_pipeline.append({"$count": "total_count"})
    count_result = await db.tickets.aggregate(count_pipeline).to_list(length=None)
    total_count = count_result[0]["total_count"] if count_result else 0

    return {"total_count": total_count, "data": ticket_data}


async def get_data_without_join(db, flagged, status, page, size):

    pipeline = []

    if flagged is not None:
        pipeline.append({"$match": {"flagged": flagged}})

    if status:
        pipeline.append({"$match": {"status": status}})

    pipeline.extend(
        [
            {"$sort": {"timestamp": -1}},
            {"$skip": (page - 1) * size},
            {"$limit": size},
        ]
    )

    ticket_data = await db.tickets.aggregate(pipeline).to_list(length=None)

    msg_ids = [ticket.get("msg_id") for ticket in ticket_data]

    messages_cursor = db.messages.find({"_id": {"$in": msg_ids}})

    messages = await messages_cursor.to_list(None)

    for ticket in ticket_data:
        ticket["message"] = next(
            (message for message in messages if message["_id"] == ticket["msg_id"]),
            None,
        )

    count_pipeline = pipeline[:-3]
    count_pipeline.append({"$count": "total_count"})
    count_result = await db.tickets.aggregate(count_pipeline).to_list(length=None)
    total_count = count_result[0]["total_count"] if count_result else 0

    return {"total_count": total_count, "data": ticket_data}


@router.get("/authors")
async def get_distinct_authors(db=Depends(get_db)):
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

    ticket = await db.tickets.find_one({"_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")

    message_ids = {ticket.get("msg_id")} | set(ticket.get("context_messages", []))
    message_ids.discard(None)

    messages_cursor = db.messages.find({"_id": {"$in": list(message_ids)}}).sort(
        "timestamp", 1
    )
    messages = await messages_cursor.to_list(None)

    reference_msg_ids = {msg.get("reference_msg_id") for msg in messages}

    if reference_msg_ids:
        reference_messages_cursor = db.messages.find(
            {"_id": {"$in": list(reference_msg_ids)}}
        )
        reference_messages = await reference_messages_cursor.to_list(None)

        for msg in messages:
            if msg.get("reference_msg_id"):
                msg["reference_msg"] = next(
                    (
                        ref_msg
                        for ref_msg in reference_messages
                        if ref_msg["_id"] == msg["reference_msg_id"]
                    ),
                    None,
                )

    ticket["messages"] = messages

    return ticket


@router.patch("/flag")
async def update_flagged_tickets(
    ticket_ids: List[str] = Body(..., embed=True),
    flagged: bool = Body(..., embed=True),
    db=Depends(get_db),
):
    """
    Flags a list of tickets by setting the flagged field to the provided value.
    """

    if not ticket_ids:
        raise HTTPException(status_code=400, detail="No ticket IDs provided.")

    try:
        operations = [
            UpdateOne({"_id": ticket_id}, {"$set": {"flagged": flagged}})
            for ticket_id in ticket_ids
        ]

        result = await db.tickets.bulk_write(operations)

    except Exception as e:
        print(f"Error updating elements: {e}")
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
    Closes a list of tickets by setting status fields to "closed".
    """

    try:
        operations = [
            UpdateOne(
                {"_id": ticket_id},
                {
                    "$set": {
                        "status": "closed",
                        "ts_last_status_change": datetime.now(timezone.utc),
                    }
                },
            )
            for ticket_id in ticket_ids
        ]

        result = await db.tickets.bulk_write(operations)

        return {
            "matched_count": result.matched_count,
            "modified_count": result.modified_count,
        }
    except Exception as e:
        print(f"Error updating elements: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/open")
async def open_tickets(
    ticket_ids: List[str] = Body(...),
    db=Depends(get_db),
):
    """
    Opens a list of tickets by setting status fields to "open".
    """

    print(f"Ticket IDs: {datetime.now(timezone.utc)}")
    try:
        operations = [
            UpdateOne(
                {"_id": ObjectId(ticket_id)},  # Convert string IDs to ObjectId
                {
                    "$set": {
                        "status": "open",
                        "ts_last_status_change": datetime.now(timezone.utc),
                    }
                },
            )
            for ticket_id in ticket_ids
        ]

        result = await db.tickets.bulk_write(operations)

        return {
            "matched_count": result.matched_count,
            "modified_count": result.modified_count,
        }
    except BulkWriteError as bwe:
        print(f"Bulk write error: {bwe.details}")
        raise HTTPException(status_code=400, detail="Error processing bulk update")
    except Exception as e:
        print(f"Error updating tickets: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{ticket_id}/resolve")
async def resolve_ticket(
    ticket_id: str,
    request: TicketResolveRequest,
    db=Depends(get_db),
):
    """
    Resolves a ticket by setting status fields to "resolved".
    """

    original_message = await db.messages.find_one({"_id": request.reply_to_message_id})
    if not original_message:
        raise HTTPException(status_code=404, detail="Original message not found")

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
        "discussion_id": original_message["discussion_id"],
        "author": request.author.dict(),  # Convert the AuthorInfo object into a dictionary
    }
    new_message_result = await db.messages.insert_one(new_message)
    new_message_id = str(new_message_result.inserted_id)

    ticket_update_result = await db.tickets.update_one(
        {"_id": ticket_id},
        {
            "$set": {
                "status": "resolved",
                "resolved_by": request.author.id,
                "ts_last_status_change": datetime.now(timezone.utc),
            },
            "$push": {"context_messages": new_message_id},
        },
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
