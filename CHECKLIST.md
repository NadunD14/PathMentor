# 📋 Deployment Checklist

## Pre-Deployment
- [ ] Code is committed and pushed to GitHub
- [ ] All environment variables are documented
- [ ] Dependencies are up to date
- [ ] Application runs locally without errors
- [ ] Database schema is finalized in Supabase

## Backend Deployment (Railway)
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend_new`
- [ ] Configure environment variables:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] GROQ_API_KEY
  - [ ] SECRET_KEY
  - [ ] ALLOWED_ORIGINS
- [ ] Deploy and verify health endpoint
- [ ] Note down Railway domain URL

## Frontend Deployment (Vercel)
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Configure environment variables:
  - [ ] NEXT_PUBLIC_API_URL (Railway URL)
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Deploy and verify frontend loads
- [ ] Test API connectivity

## Post-Deployment
- [ ] Update backend CORS with frontend domain
- [ ] Test complete user flow
- [ ] Set up domain names (optional)
- [ ] Configure monitoring
- [ ] Set up automatic deployments
- [ ] Document production URLs

## Production URLs
- Backend: ________________
- Frontend: _______________
- Database: https://supabase.com/dashboard