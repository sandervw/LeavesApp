# GitHub Actions Workflows

This directory contains automated deployment workflows for the Leaves application.

## Workflows

### 1. `azure-static-web-apps.yml` - Frontend Deployment
Deploys the React frontend to Azure Static Web Apps.

**Triggers:**
- Push to `main` or `feature/*` branches
- Pull requests to `main` or `feature/*` branches

**Environments:**
- **Production**: Deploys from `main` branch to production environment
- **Preview**: Deploys from feature branches and PRs to preview environment

### 2. `azure-backend-deploy.yml` - Backend Deployment
Builds Docker images and deploys the Express backend to Azure Container Apps.

**Triggers:**
- Push to `main` or `feature/*` branches (only when backend files change)
- Pull requests to `main` or `feature/*` branches (only when backend files change)

**Environments:**
- **Production**: Deploys from `main` branch to `leaves-prd-ca`
- **Dev**: Deploys from feature branches and PRs to `leaves-dev-ca`

## Required GitHub Secrets

Add these secrets in your GitHub repository settings (Settings > Secrets and variables > Actions):

### Frontend Deployment Secrets

| Secret Name | Description | How to Obtain |
|------------|-------------|---------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token for Azure Static Web Apps | Azure Portal > Static Web App > Overview > Manage deployment token |

### Backend Deployment Secrets

| Secret Name | Description | How to Obtain |
|------------|-------------|---------------|
| `AZURE_REGISTRY_USERNAME` | Azure Container Registry username | Azure Portal > Container Registry > Access keys > Username |
| `AZURE_REGISTRY_PASSWORD` | Azure Container Registry password | Azure Portal > Container Registry > Access keys > password/password2 |
| `AZURE_CREDENTIALS` | Service principal credentials for Azure CLI | See instructions below |

#### Creating AZURE_CREDENTIALS

Run these commands to create a service principal with access to your resource group:

```bash
# Create service principal with contributor access to resource group
az ad sp create-for-rbac \
  --name "github-actions-leaves-backend" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/leaves-app-rg \
  --sdk-auth
```

This will output JSON credentials. Copy the entire JSON output and add it as the `AZURE_CREDENTIALS` secret.

To find your subscription ID:
```bash
az account show --query id -o tsv
```

## Deployment Flow

### Production Deployment (main branch)
1. Push to `main` triggers both workflows
2. Frontend builds and deploys to production Static Web App
3. Backend builds Docker image, pushes to ACR, updates Container App
4. Production sites available at:
   - Frontend: https://wordleaves.com
   - Backend: https://api.wordleaves.com

### Preview Deployment (feature branches)
1. Push to feature branch or open PR triggers both workflows
2. Frontend deploys to preview environment on Static Web App
3. Backend deploys to dev Container App
4. Preview sites available at:
   - Frontend: Azure-generated preview URL
   - Backend: https://api-dev.wordleaves.com

## Troubleshooting

### Backend deployment shows old update date
The workflow includes a forced revision activation step to ensure updates take effect:
```bash
az containerapp revision activate
```
This addresses intermittent issues with `az containerapp update` not triggering new revisions.

### Image not updating in Container App
- Check the GitHub Actions logs for the deployment job
- Verify the image was pushed to ACR: `az acr repository show-tags --name leavescr --repository leaves-backend`
- Check Container App revisions: `az containerapp revision list --name leaves-prd-ca --resource-group leaves-app-rg`
- Manually trigger a revision if needed

### Frontend preview not deploying
- Ensure `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is set correctly
- Check that the PR is from an allowed branch pattern (`feature/*`)
- Review GitHub Actions logs for build errors
