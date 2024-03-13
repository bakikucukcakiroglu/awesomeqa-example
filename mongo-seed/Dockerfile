# Use the official MongoDB image as a base image
FROM mongo

# Install dependencies such as jq for JSON processing
RUN apt-get update && apt-get install -y jq

# Copy the initialization script and data into the container
COPY ./mongo-seed/load.sh /docker-entrypoint-initdb.d/load.sh
COPY ./mongo-seed/data /mongo-seed/data

# Make the load script executable
RUN chmod +x /docker-entrypoint-initdb.d/load.sh

# MongoDB will execute scripts in docker-entrypoint-initdb.d when the container starts