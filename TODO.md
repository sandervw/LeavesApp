# Pre-Deployment Audit & TODO List

## Azure Deployment Guide

Resources needed:

- 2x mongoDB atlas cluster (DEV and PRD)
- 1x azure static web apps (DEV and PRD)
  - free tier has 2 custom domains/app, 3 preview environments
  - main branch = production, feature branches = preview
  - 100GB/month bandwidth
- 2x azure container apps
  - probably "free" for low usage
  - package express app as docker container
  - two container apps in same resource group
- 2x azure key vaults (DEV and PRD)
  - stored in same resource group
