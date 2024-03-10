from fastapi import APIRouter, Depends, HTTPException, Query, Body
from fastapi.responses import JSONResponse
from pymongo import UpdateOne
from typing import Optional, Dict, List
from pydantic import BaseModel, Field
from bson import SON, ObjectId
from ..db import get_db

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
    db=Depends(get_db),
):
    """
    Retrieves a list of tickets with optional filters.
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
    ]

    pipeline.append({"$match": {"resolved_by": None}})

    if flagged is not None:
        pipeline.append({"$match": {"flagged": flagged}})

    if author:
        pipeline.append({"$match": {"message.author.name": author}})

    if channel:
        pipeline.append({"$match": {"message.channel_id": channel}})

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
                "from": "messages",  # Join with the messages collection.
                "localField": "msg_id",  # Field from the tickets collection.
                "foreignField": "_id",  # Field from the messages collection.
                "as": "message",  # Output array for joined documents.
            }
        },
        {"$unwind": "$message"},  # Deconstruct the array.
        {
            "$group": {"_id": "$message.channel_id"}
        },  # Group by channel_id to get distinct values.
        {
            "$project": {"_id": 0, "channel_id": "$_id"}
        },  # Project the results to include only channel_id.
    ]

    result = await db.tickets.aggregate(pipeline).to_list(None)

    distinct_channels = [item["channel_id"] for item in result]
    return distinct_channels


@router.get("/{ticket_id}", response_model=Dict)
async def get_ticket_with_messages(ticket_id: str, db=Depends(get_db)):

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


@router.patch("/resolved_by")
async def resolve_tickets(
    ticket_ids: List[str] = Body(...),
    resolved_by: str = Body(...),
    db=Depends(get_db),
):
    """
    Resolves a list of tickets by setting the resolved_by field to the provided value.
    """

    try:
        operations = [
            UpdateOne({"_id": ticket_id}, {"$set": {"resolved_by": resolved_by}})
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


@router.put("/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    ticket_data: Dict,
    db=Depends(get_db),
):
    """
    Updates a ticket identified by its ID.
    """

    result = await db.tickets.update_one({"_id": ticket_id}, {"$set": ticket_data})

    return {"_id": ticket_id, "modified_count": result.modified_count}
