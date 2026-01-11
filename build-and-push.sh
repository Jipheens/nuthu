#!/bin/bash

# Build and push Docker images for Nuthu Collections

echo "Building frontend image..."
docker build -t jipheens/nuthu_collections_frontend:latest .

echo "Building backend image..."
cd backend
docker build -t jipheens/nuthu_collections_backend:latest .
cd ..

echo "Pushing images to Docker Hub..."
docker push jipheens/nuthu_collections_frontend:latest
docker push jipheens/nuthu_collections_backend:latest

echo "Build and push completed successfully!"
echo ""
echo "Next steps:"
echo "1. SSH to your server: ssh root@173.212.221.125"
echo "2. Run deployment script: bash deploy-erp.sh"
