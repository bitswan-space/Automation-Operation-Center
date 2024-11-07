#!/bin/bash

# Usage: ./build_and_push.sh <context_path>

# Check if context path argument is provided
if [ -z "$1" ]; then
  echo "Error: No build context path provided."
  echo "Usage: ./build_and_push.sh <context_path>"
  exit 1
fi

# Set variables
CONTEXT_PATH="$1"
YEAR=$(date +%Y)
COMMIT_HASH=$(git rev-parse --short HEAD)
IMAGE_TAG="bitswan/pipeline-operations-centre"

# Build Docker images with specified context path
docker build -t $IMAGE_TAG:latest -t $IMAGE_TAG:$YEAR-${GITHUB_RUN_ID}-git-$COMMIT_HASH --build-arg COMMIT_HASH=$COMMIT_HASH --build-arg BUILD_NO=$BUILD_NO "$CONTEXT_PATH"

# Push Docker images
docker push $IMAGE_TAG:latest
docker push $IMAGE_TAG:$YEAR-${GITHUB_RUN_ID}-git-$COMMIT_HASH

# Push a tag with the image ID
IMAGE_ID=$(docker images --no-trunc -q $IMAGE_TAG:latest | sed 's/:/_/g')
docker tag $IMAGE_TAG:latest $IMAGE_TAG:$IMAGE_ID
docker push $IMAGE_TAG:$IMAGE_ID
