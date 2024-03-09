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


@router.patch("/flag")
async def update_flagged_tickets(
    ticket_ids: List[str] = Body(..., embed=True),
    flagged: bool = Body(..., embed=True),
    db=Depends(get_db),
):
    if not ticket_ids:
        raise HTTPException(status_code=400, detail="No ticket IDs provided.")

    operations = [
        UpdateOne({"_id": ticket_id}, {"$set": {"flagged": flagged}})
        for ticket_id in ticket_ids
    ]

    result = await db.tickets.bulk_write(operations)

    return {
        "matched_count": result.matched_count,
        "modified_count": result.modified_count,
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

    result = await db.tickets.update_one({"_id": ticket_id}, {"$set": ticket_data})

    return {"_id": ticket_id, "modified_count": result.modified_count}


@router.delete("/")
async def delete_tickets(
    ticket_ids: List[str] = Body(...),
    db=Depends(get_db),
):
    """
    Deletes multiple elements identified by their IDs.
    """

    try:
        delete_result = await db.tickets.delete_many({"_id": {"$in": ticket_ids}})

        if delete_result.deleted_count == 0:
            raise HTTPException(
                status_code=404, detail="No elements found with the provided IDs"
            )

        return JSONResponse(
            {"message": f"{delete_result.deleted_count} elements deleted successfully"}
        )
    except Exception as e:
        print(f"Error deleting elements: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


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
