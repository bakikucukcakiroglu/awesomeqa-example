# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables to minimize unnecessary outputs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the Docker container
WORKDIR /app

# Install any necessary dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application's code into the container
COPY . /app

# Set PYTHONPATH to include the /app directory
ENV PYTHONPATH "${PYTHONPATH}:/app"

# Command to run the application using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
