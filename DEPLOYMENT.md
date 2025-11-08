# 🚀 PathMentor Deployment Guide

## Overview
This guide will help you deploy PathMentor with:
- **Frontend**: Vercel (React/Next.js)
- **Backend**: Railway (FastAPI/Python)

## Prerequisites
- GitHub account
- Vercel account
- Railway account
- Supabase account (for database)
- API keys (Groq, YouTube, etc.)

---

## 📦 Part 1: Backend Deployment on Railway

### Step 1: Prepare the Repository
1. Ensure your code is pushed to GitHub
2. Make sure all environment variables are configured

### Step 2: Deploy to Railway
1. Go to [Railway](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your PathMentor repository
5. **Important**: Set the root directory to `backend_new`

### Step 3: Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```env
# Database
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# External APIs
GROQ_API_KEY=your-groq-api-key
YOUTUBE_API_KEY=your-youtube-api-key-optional
UDEMY_CLIENT_ID=your-udemy-client-id-optional
UDEMY_CLIENT_SECRET=your-udemy-client-secret-optional
REDDIT_CLIENT_ID=your-reddit-client-id-optional
REDDIT_CLIENT_SECRET=your-reddit-client-secret-optional
REDDIT_USER_AGENT=PathMentor/1.0

# Security
SECRET_KEY=generate-a-random-secret-key
ALLOWED_ORIGINS=*

# Application
DEBUG=False
LOG_LEVEL=INFO
```

### Step 4: Domain & Health Check
1. Railway will provide a domain like `your-app.railway.app`
2. Test the health endpoint: `https://your-app.railway.app/api/v1/health`
3. (Optional) Add custom domain in Railway settings

---

## 🌐 Part 2: Frontend Deployment on Vercel

### Step 1: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set the root directory to `frontend`
5. Framework preset should be "Next.js"

### Step 2: Configure Environment Variables
In Vercel dashboard, go to Settings > Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-app.railway.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 3: Update Backend CORS
Update your Railway backend environment variables:
```env
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### Step 4: Deploy & Test
1. Vercel will automatically deploy
2. Test your frontend at `https://your-app.vercel.app`
3. (Optional) Add custom domain

---

## 🔧 Configuration Files Created

### Backend Files:
- `Procfile` - Railway process definition
- `railway.toml` - Railway configuration
- `runtime.txt` - Python version specification
- `.env.example` - Environment variables template

### Frontend Files:
- `vercel.json` - Vercel deployment configuration
- `next.config.ts` - Updated Next.js configuration
- `.env.example` - Environment variables template

---

## 🧪 Testing Your Deployment

### Backend Health Check:
```bash
curl https://your-app.railway.app/api/v1/health
```
Expected response: `{"status": "healthy"}`

### Frontend Test:
Visit `https://your-app.vercel.app` and check:
- Page loads without errors
- API calls work (check browser console)
- Authentication flows function

---

## 🔍 Troubleshooting

### Common Backend Issues:
1. **Import errors**: Ensure all dependencies are in `requirements.txt`
2. **Port issues**: Railway sets `PORT` env var automatically
3. **Database connections**: Verify Supabase credentials
4. **API keys**: Check Groq and other API keys are valid

### Common Frontend Issues:
1. **API not connecting**: Check `NEXT_PUBLIC_API_URL` is correct
2. **Build errors**: Review Next.js build logs in Vercel
3. **Environment vars**: Ensure all `NEXT_PUBLIC_*` vars are set
4. **CORS errors**: Update backend `ALLOWED_ORIGINS`

### Build Commands:
If you need custom build commands:

**Railway (Backend)**:
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Vercel (Frontend)**:
- Build: `npm run build`
- Start: `npm start`

---

## 🎉 Success!
Once deployed, your PathMentor application will be live:
- Backend API: `https://your-app.railway.app`
- Frontend App: `https://your-app.vercel.app`

Remember to:
1. Update DNS settings if using custom domains
2. Set up monitoring and error tracking
3. Configure automatic deployments for main branch
4. Set up staging environments for testing

---

## 📞 Support
If you encounter issues:
1. Check Railway/Vercel logs
2. Verify environment variables
3. Test API endpoints individually
4. Check this guide's troubleshooting section