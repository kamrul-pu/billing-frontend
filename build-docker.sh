#!/bin/bash

# Build script for Docker with environment variables from .env.local

# Load environment variables from .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Build the Docker image with build arguments
docker build \
    --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
    --build-arg NEXT_PUBLIC_APP_NAME="${NEXT_PUBLIC_APP_NAME}" \
    --build-arg NEXT_PUBLIC_APP_VERSION="${NEXT_PUBLIC_APP_VERSION}" \
    -t isp-frontend:latest \
    .

echo "Docker image built successfully!"
echo "To run the container, use:"
echo "docker run -p 3000:3000 isp-frontend:latest"
