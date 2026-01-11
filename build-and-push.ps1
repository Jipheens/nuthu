# Build and push Docker images for Nuthu Collections

Write-Host "Building frontend image..." -ForegroundColor Green
docker build -t jipheens/nuthu_collections_frontend:latest .

Write-Host "Building backend image..." -ForegroundColor Green
Set-Location backend
docker build -t jipheens/nuthu_collections_backend:latest .
Set-Location ..

Write-Host "Pushing images to Docker Hub..." -ForegroundColor Green
docker push jipheens/nuthu_collections_frontend:latest
docker push jipheens/nuthu_collections_backend:latest

Write-Host "Build and push completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. SSH to your server: ssh root@173.212.221.125"
Write-Host "2. Run deployment script: bash deploy-erp.sh"
