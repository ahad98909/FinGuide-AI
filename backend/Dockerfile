# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (build tools, tesseract-ocr, and OpenCV runtime libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container
COPY . .

# Expose port 8000 for FastAPI
EXPOSE 8000

# Run uvicorn on container startup
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
