#!/bin/bash

# Example command to load data into MongoDB
# Replace `your_data_file.json` and `your_collection` with your actual file and MongoDB collection name
# Ensure MongoDB is up and accessible before trying to import data
echo "Waiting for MongoDB to start..."
sleep 10 # Adjust based on your needs; ensures MongoDB is available
mongoimport --uri "mongodb://your_mongodb_uri" --collection your_collection --file /path/to/your_data_file.json --jsonArray

# Start the FastAPI application
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
