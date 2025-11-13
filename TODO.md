# Pre-Deployment Audit & TODO List

## Azure Deployment Guide

### Phase 1: DEV Environment Setup

#### Required Azure Resources

1. **Azure App Service** (Backend API)

   - Service Plan: B1 (Basic) - ~$13/month
   - Runtime: Node.js 20 LTS
   - OS: Linux

2. **Azure Static Web Apps** (Frontend)

   - Free tier
   - Auto-builds from GitHub
   - Automatic SSL certificates

3. **Database** (Choose one):

   - **Azure Cosmos DB** (MongoDB API) - Fully managed, ~$24/month minimum
   - **MongoDB Atlas** - Free M0 tier available

4. **Azure Key Vault**

   - Standard tier - ~$0.03/month
   - Store JWT secrets, API keys

5. **Application Insights**
   - Free tier: 5GB/month included
   - Tracks errors, performance, requests

#### Deployment Steps

```bash
# 1. Install Azure CLI
az login

# 2. Create resource group
az group create --name leaves-dev-rg --location eastus

# 3. Create App Service Plan
az appservice plan create \
  --name leaves-dev-plan \
  --resource-group leaves-dev-rg \
  --sku B1 \
  --is-linux

# 4. Create Web App
az webapp create \
  --resource-group leaves-dev-rg \
  --plan leaves-dev-plan \
  --name leaves-backend-dev \
  --runtime "NODE:20-lts"

# 5. Create Static Web App
az staticwebapp create \
  --name leaves-frontend-dev \
  --resource-group leaves-dev-rg \
  --source https://github.com/YOUR_USERNAME/LeavesApp \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"

# 6. Create Key Vault
az keyvault create \
  --name leaves-vault-dev \
  --resource-group leaves-dev-rg \
  --location eastus

# 7. Add secrets to Key Vault
az keyvault secret set --vault-name leaves-vault-dev \
  --name jwt-secret --value "your-generated-secret-here"

az keyvault secret set --vault-name leaves-vault-dev \
  --name jwt-refresh-secret --value "your-other-secret-here"

az keyvault secret set --vault-name leaves-vault-dev \
  --name resend-api-key --value "your-resend-key"

# 8. Create Application Insights
az monitor app-insights component create \
  --app leaves-dev-insights \
  --location eastus \
  --resource-group leaves-dev-rg \
  --application-type Node.JS

# 9. Configure App Service environment variables
az webapp config appsettings set \
  --resource-group leaves-dev-rg \
  --name leaves-backend-dev \
  --settings \
    NODE_ENV=development \
    PORT=8080 \
    KEY_VAULT_NAME=leaves-vault-dev \
    APP_ORIGIN=https://leaves-frontend-dev.azurestaticapps.net
```

#### DEV Environment Costs (Estimated)

- App Service B1: ~$13/month
- Static Web Apps: Free
- MongoDB Atlas M0: Free
- Key Vault: ~$0.03/month
- Application Insights: Free tier
- **Total: ~$15/month**

---

### Phase 2: PRD Environment Setup

#### Additional PRD-Specific Steps

1. **Custom Domain & SSL**

   - Register domain (e.g., leavesapp.com)
   - Configure DNS in Azure
   - SSL auto-provisioned

2. **Production App Service**

   - Service Plan: P1V2 - ~$73/month
   - Auto-scaling: 2-5 instances

3. **Production Database**

   - MongoDB Atlas M10: ~$57/month
   - OR Azure Cosmos DB: ~$24+/month

4. **CDN** (Optional but recommended)

   - Azure CDN or Cloudflare
   - Cache static assets globally
   - ~$5/month

5. **Monitoring & Alerts**
   ```bash
   # Create alert for high error rate
   az monitor metrics alert create \
     --name high-error-rate \
     --resource-group leaves-prd-rg \
     --scopes /subscriptions/.../leaves-backend-prd \
     --condition "count exceptions > 5" \
     --window-size 5m \
     --evaluation-frequency 1m
   ```

#### PRD Environment Costs (Estimated)

- App Service P1V2: ~$73/month
- Static Web Apps: Free
- MongoDB Atlas M10: ~$57/month
- CDN: ~$5/month
- Application Insights: ~$5/month
- **Total: ~$140/month**

---

### Deployment Workflow

```
Local Development
    ↓
    Push to GitHub (feature branch)
    ↓
    Auto-deploy to DEV environment
    ↓
    Run automated tests (Vitest)
    ↓
    Manual QA testing
    ↓
    Create Pull Request
    ↓
    Code review
    ↓
    Merge to main branch
    ↓
    Auto-deploy to PRD environment
    ↓
    Monitor Application Insights
```

---

## Pre-Deployment Checklists

### Before Deploying to DEV

**Security (Week 1):**

- [ ] Add rate limiting (express-rate-limit)
- [ ] Install helmet.js for security headers
- [ ] Fix XSS vulnerability in InlineSVG.jsx (DOMPurify)
- [ ] Implement Winston logging
- [ ] Replace all console.log with logger calls
- [ ] Improve health check endpoint (test DB connection)
- [ ] Increase password minimum to 12 characters
- [ ] Add password complexity requirements

**Azure Setup (Week 2):**

- [ ] Create Azure account
- [ ] Setup Key Vault for secrets
- [ ] Configure Application Insights
- [ ] Setup MongoDB Atlas (free M0 tier)
- [ ] Create .env.example file
- [ ] Add compound database indexes
- [ ] Test all endpoints with new configuration

**Deployment (Week 3):**

- [ ] Create Azure resource group
- [ ] Deploy backend to App Service
- [ ] Deploy frontend to Static Web Apps
- [ ] Configure environment variables
- [ ] Test authentication flow
- [ ] Test all CRUD operations
- [ ] Verify email sending works
- [ ] Load test (100 concurrent users)
- [ ] Review Application Insights logs

### Before Deploying to PRD

**Additional Hardening:**

- [ ] Implement soft deletes
- [ ] Add API versioning (/api/v1)
- [ ] Setup automated backups
- [ ] Document disaster recovery procedure
- [ ] Security penetration testing
- [ ] Setup monitoring alerts
- [ ] Create runbook for common issues
- [ ] User acceptance testing
- [ ] Performance testing
- [ ] Setup CDN for frontend assets

**Business Readiness:**

- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Contact/support email
- [ ] Error reporting mechanism
- [ ] User feedback system
- [ ] Analytics (optional)

---

## Recommended Action Plan

### Week 1: Critical Security Fixes

**Total Time: ~8 hours**

1. **Monday:** Rate limiting + Helmet (1 hour)
2. **Tuesday:** Winston logging implementation (2 hours)
3. **Wednesday:** Replace console.log with logger (2 hours)
4. **Thursday:** Fix XSS vulnerability + password validation (1.5 hours)
5. **Friday:** Health check improvements + testing (1.5 hours)

### Week 2: Azure Preparation

**Total Time: ~10 hours**

1. **Monday:** Create Azure account + setup (2 hours)
2. **Tuesday:** MongoDB Atlas setup + migration (3 hours)
3. **Wednesday:** Database indexes + .env.example (2 hours)
4. **Thursday:** API versioning implementation (2 hours)
5. **Friday:** Integration testing (1 hour)

### Week 3: DEV Deployment

**Total Time: ~12 hours**

1. **Monday:** Create Azure resources (3 hours)
2. **Tuesday:** Deploy backend + configure (3 hours)
3. **Wednesday:** Deploy frontend + test (3 hours)
4. **Thursday:** Key Vault integration (2 hours)
5. **Friday:** Load testing + bug fixes (1 hour)

### Week 4+: PRD Preparation (if moving to production)

- Implement soft deletes (2 hours)
- Setup automated backups (2 hours)
- RBAC implementation (2 hours)
- Security penetration testing (4 hours)
- Documentation (2 hours)
- User acceptance testing (4 hours)

---

## Comparison to Other Indie Apps

### Better Than Most ✅

- JWT refresh token rotation
- Session management system
- Email verification flow
- Comprehensive test suite (17 files, 6,177 lines)
- Proper TypeScript backend architecture
- Layered architecture (routes/controllers/services/models)
- User data isolation

### Typical Gaps (Same as Most Indie Apps) ⚠️

- Missing rate limiting
- No production logging infrastructure
- No secrets management (Key Vault)
- Hard deletes instead of soft deletes
- No monitoring/observability
- No database migration strategy

### Red Flags Compared to Production Apps 🔴

- XSS vulnerability (needs immediate attention)
- Lack of rate limiting (major security issue)
- No rollback strategy for deployments
- Weak password requirements (6 chars minimum)

**Overall Verdict:** Top 30% of indie developer apps. With 2-3 weeks of hardening work, will be production-ready.

---

## Questions & Considerations

### Security Questions

- [ ] Do we need 2FA/MFA for accounts?
- [ ] Should we implement account lockout after failed logins?
- [ ] Do we need email verification before first login?
- [ ] Should we notify users of new login locations?

### Business Questions

- [ ] What's our expected user base (100? 1,000? 10,000+)?
- [ ] Do we need premium/free tiers?
- [ ] What's our data retention policy?
- [ ] Do we need GDPR compliance? (if EU users)
- [ ] What's our SLA for uptime?

### Technical Questions

- [ ] Do we need real-time collaboration features?
- [ ] Should we implement websockets for live updates?
- [ ] Do we need file upload capabilities?
- [ ] What's our max file/text size limit?
- [ ] Do we need full-text search?

---

## Next Steps

**Immediate (This Week):**

1. Review this TODO list
2. Prioritize which items to tackle first
3. Setup GitHub project board for tracking
4. Create feature branch: `security/pre-deployment-hardening`

**Short-term (Weeks 1-2):**

1. Implement critical security fixes
2. Setup Azure account and resources
3. Configure MongoDB Atlas

**Medium-term (Weeks 3-4):**

1. Deploy to DEV environment
2. Load testing and bug fixes
3. Documentation updates

**Long-term (Month 2+):**

1. Deploy to PRD environment
2. Implement medium priority features
3. Monitor and iterate

---

## Resources

### Documentation

- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [Helmet.js](https://helmetjs.github.io/)
- [Winston Logger](https://github.com/winstonjs/winston)

### Security

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)

### Azure Pricing

- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
- [MongoDB Atlas Pricing](https://www.mongodb.com/pricing)

---

**Last Updated:** 2025-11-11
**Author:** Claude Code
**Status:** Pre-deployment audit complete, ready for implementation
