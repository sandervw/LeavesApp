# Pre-Deployment Audit & TODO List

## Azure Deployment Guide

Resources needed:

- (DONE) 1x azure resource group (leaves-app-rg)
- (DONE) 2x azure key vaults (leaves-dev-keys, leaves-prd-keys)
- (DONE) 2x azure mongo db atlas collections (leaves-dev-db, leaves-prd-db)
  - dev and prd users with proper roles/permissions
  - stored on same cluster:
- (DONE) 1x azure static web apps
  - free tier has 2 custom domains/app, 3 preview environments
  - main branch = production, feature branches = preview
  - 100GB/month bandwidth
- (DONE) 1x azure container registry
- (DONE) 1x dockerfile for backend express app (deploy to container registry)
- (DONE) 2x azure container apps (leaves-dev-ca, leaves-prd-ca)
  - probably "free" for low usage
  - package express app as docker container
  - two container apps in same resource group
  - each container app runs different docker image tag (dev vs prd)
  - each container app connects to its respective key vault for secrets
- (DONE) 1x domain name (wordleaves.com)

  1. wordleaves.com → Static Web App (production frontend)

  - Status: Ready with SSL

  2. dev.wordleaves.com → Static Web App (preview frontend)

  - Status: Ready with SSL

  3. api-dev.wordleaves.com → Dev Container App (dev backend)

  - SSL: SniEnabled ✓

  4. api.wordleaves.com → Production Container App (production backend)

  - SSL: SniEnabled ✓

  CNAME Records (In cloudflare):

  - @ → lemon-hill-0a60a3510.3.azurestaticapps.net
  - dev → lemon-hill-0a60a3510.3.azurestaticapps.net
  - api-dev → leaves-dev-ca.bravedune-c58d044d.centralus.azurecontainerapps.io
  - api → leaves-prd-ca.kindgrass-e7a2c625.centralus.azurecontainerapps.io

  TXT Records (for validation):

  - \_dnsauth (for wordleaves.com)
  - \_dnsauth.dev (for dev.wordleaves.com)
  - asuid.api-dev (for api-dev.wordleaves.com)
  - asuid.api (for api.wordleaves.com)

## Docker Deployment

cd backend &&
docker build -t leaves-backend:prd . &&
az acr login --name leavescr &&
docker tag leaves-backend:prd leavescr-bvhvdthwh4e8dddj.azurecr.io/leaves-backend:prd &&
docker push leavescr-bvhvdthwh4e8dddj.azurecr.io/leaves-backend:prd &&
az containerapp update \
 --name leaves-prd-ca \
 --resource-group leaves-app-rg \
 --image leavescr-bvhvdthwh4e8dddj.azurecr.io/leaves-backend:prd

az containerapp show \
 --name leaves-dev-ca \
 --resource-group leaves-app-rg \
 --query "properties.outboundIpAddresses" -o json

az containerapp logs show \
 --name leaves-dev-ca \
 --resource-group leaves-app-rg \
 --follow
