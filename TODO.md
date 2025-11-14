# Pre-Deployment Audit & TODO List

## Azure Deployment Guide

Resources needed:

- (DONE) 1x azure resource group (leaves-app-rg)
- (DONE) 2x azure key vaults (leaves-dev-keys, leaves-prd-keys)
- (DONE) 2x azure mongo db atlas collections (leaves-dev-db, leaves-prd-db)
  - dev and prd users with proper roles/permissions
  - stored on same cluster:
- 1x azure static web apps
  - free tier has 2 custom domains/app, 3 preview environments
  - main branch = production, feature branches = preview
  - 100GB/month bandwidth
- 2x azure container apps
  - probably "free" for low usage
  - package express app as docker container
  - two container apps in same resource group

## TODO

Steps:

1. Build your frontend
   cd frontend
   npm run build # Creates dist/ folder
2. Deploy to Azure Static Web Apps (easiest via Azure Portal):

- Go to Azure Portal → Create "Static Web App"
- Choose "Custom" (not GitHub integration initially)
- Upload the frontend/dist/ folder
- Or connect to your GitHub repo (it'll auto-deploy on pushes to main/feature branches)

3. Configure environment variables in Azure Portal:

- Set VITE_API_URL to point to your backend Container App URL (you'll get this after step 2)

2. Azure Container Apps (Backend) - Docker Required

Since you haven't used Docker, here's what you need to know:

Docker Basics:

- Docker packages your app + dependencies into a "container image"
- Think of it as a lightweight VM that runs your Express app
- You'll create a Dockerfile that describes how to build this image

Steps:

A. Create Dockerfile for Backend

I can help you create a backend/Dockerfile:

FROM node:18-alpine
WORKDIR /app
COPY package\*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8080
CMD ["node", "dist/server.js"]

B. Build & Push Docker Image

You'll need Azure Container Registry (ACR):

1. Create ACR in Azure Portal (same resource group)
2. Build and push image:
   cd backend
   npm run build # Compile TypeScript

Login to your Azure Container Registry
az acr login --name <your-acr-name>

Build image
docker build -t <your-acr-name>.azurecr.io/leaves-backend:latest .

Push to ACR
docker push <your-acr-name>.azurecr.io/leaves-backend:latest

C. Create Container Apps (2x - dev & prd)

For each environment:

1. Azure Portal → Create "Container App"
2. Point to your ACR image
3. Connect to Key Vault for secrets:

- Enable managed identity on Container App
- Grant Key Vault access to this identity
- Reference secrets as environment variables:
  MONGO_URI: secretref:mongo-uri
  JWT_SECRET: secretref:jwt-secret

4. Set other env vars (NODE_ENV, PORT, APP_ORIGIN, etc.)
5. Configure ingress (external, port 8080)

D. Upload Secrets to Key Vault

Use your upload-secrets.ps1 script to populate the Key Vaults with:

- MONGO_URI (from Atlas)
- JWT_SECRET
- JWT_REFRESH_SECRET
- RESEND_API_KEY
- etc.

Do you want me to:

1. Create the Dockerfile for your backend?
2. Create a deployment script to automate the Docker build/push process?
3. Help set up your upload-secrets.ps1 to include all necessary secrets?
4. Write step-by-step instructions for creating the Container Apps in Azure Portal?

Which would be most helpful to start with?
