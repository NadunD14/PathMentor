# PathMentor Testing Instructions

This guide provides step-by-step instructions for testing the PathMentor backend database connections and frontend-backend integration.

## 📋 Prerequisites

### 1. Environment Setup
- Python 3.11 or higher
- Node.js 18 or higher
- Supabase account and project
- OpenAI API key

### 2. Required Environment Variables

Create `.env` files in both frontend and backend directories:

#### Frontend `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BACKEND_URL=http://localhost:8000
```

#### Backend `.env`:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=PathMentor/1.0
YOUTUBE_API_KEY=your_youtube_api_key
DEBUG=true
LOG_LEVEL=INFO
PORT=8000
HOST=0.0.0.0
ALLOWED_ORIGINS=http://localhost:3000
```

## 🗄️ Testing Backend Database Connections

### Step 1: Install Backend Dependencies
```powershell
cd backend
pip install -r requirements.txt
pip install -r requirements-test.txt
```

### Step 2: Verify Supabase Schema
Ensure your Supabase database has the required tables:
- `users`
- `categories` 
- `paths`
- `tasks`
- `user_task_feedback`
- `user_answers`
- `user_learning_styles`
- `ai_model_logs`

### Step 3: Run Database Connection Tests
```powershell
# From backend directory
python tests/test_database_connection.py
```

**Expected Output:**
```
🚀 Starting PathMentor Backend Database Tests
==================================================
🔍 Testing database connection...
✅ Database connection successful!

🧑‍💻 Testing User Operations...
✅ User created with ID: test_user_1234567890
✅ User retrieved: test_user
✅ User updated: UpdatedUser

📚 Testing Category Operations...
✅ Retrieved 5 categories
✅ Retrieved category: Technology

🛤️ Testing Path Operations...
✅ Path created with ID: 123
✅ Path retrieved: Test Learning Path
✅ User has 1 paths

📝 Testing Task Operations...
✅ Created 2 tasks
✅ Path has 2 tasks

💬 Testing Feedback Operations...
✅ Feedback created with ID: 456
✅ Task has 1 feedback entries
✅ User has 1 feedback entries

🏗️ Testing Repository Pattern...
✅ UserRepository: Found 1 users
✅ PathRepository: Found 1 paths
✅ TaskRepository: Found 2 tasks

==================================================
🎉 All database tests completed!
```

### Step 4: Troubleshooting Database Issues

**Connection Failed:**
- Verify Supabase URL and keys in `.env`
- Check Supabase project status
- Ensure RLS policies allow service role access

**Table Not Found:**
- Run the SQL scripts in `database/init.sql`
- Verify table names match the schema
- Check case sensitivity

**Permission Denied:**
- Use `SUPABASE_SERVICE_ROLE_KEY` for backend operations
- Verify RLS policies
- Check user permissions

## 🚀 Testing Backend API Server

### Step 1: Start the Backend Server
```powershell
# From backend directory
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345]
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 2: Test API Health Check
Open browser or use curl:
```powershell
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected"
}
```

### Step 3: Test API Documentation
Visit: `http://localhost:8000/docs`

You should see the FastAPI Swagger documentation with:
- `/api/generate-path` endpoint
- `/api/feedback` endpoint
- Request/response schemas

## 🔗 Testing Frontend-Backend Integration

### Step 1: Install Frontend Dependencies
```powershell
cd frontend
npm install
```

### Step 2: Start Frontend Development Server
```powershell
# From frontend directory
npm run dev
```

**Expected Output:**
```
   ▲ Next.js 14.0.0
   - Local:        http://localhost:3000
   - Ready in 2.1s
```

### Step 3: Run Integration Tests
```powershell
# From backend directory (with server running)
python tests/test_integration.py
```

**Expected Output:**
```
🔗 PathMentor Frontend-Backend Integration Tests
============================================================
🚀 Testing Backend API Endpoints
==================================================
🔍 Testing API health check...
✅ API is healthy: {'status': 'healthy', 'timestamp': '...'}

🛤️ Testing learning path generation...
✅ Path generated successfully!
   - Path ID: generated_path_123
   - Title: Python Programming Learning Path
   - Steps: 5
   - Duration: 300 minutes

💬 Testing feedback submission...
✅ Feedback submitted successfully!
   - Feedback ID: feedback_456
   - Status: received

🌐 Testing Frontend Integration (Simulated)
==================================================
📱 Simulating frontend service calls...
✅ UserService: User authentication and profile management
✅ CategoryService: Category selection and management
✅ PathService: Learning path CRUD operations
✅ TaskService: Task management and progress tracking
✅ FeedbackService: User feedback collection
✅ BackendAPIService: API communication with backend

🎯 Frontend integration points verified!
```

### Step 4: Test Complete User Workflow
The integration test includes a complete workflow simulation:

1. **User Registration/Login** (Frontend → Supabase)
2. **Category Selection** (Frontend → Backend → Database)
3. **Learning Path Generation** (Frontend → Backend → LLM Service → Database)
4. **Progress Tracking** (Frontend → Backend → Database)
5. **Feedback Collection** (Frontend → Backend → Database)

## 🧪 Manual Testing Scenarios

### Scenario 1: Generate Learning Path
1. Start both frontend and backend servers
2. Navigate to `http://localhost:3000`
3. Log in or register a user
4. Select a learning category
5. Fill out learning preferences form
6. Submit to generate path
7. Verify path appears with steps and resources

### Scenario 2: Track Progress
1. Complete Scenario 1
2. Mark tasks as completed
3. Provide feedback on tasks
4. Check progress updates in database

### Scenario 3: Error Handling
1. Stop backend server
2. Try to generate path from frontend
3. Verify error handling displays user-friendly message
4. Restart backend and verify recovery

## 🔧 Common Issues and Solutions

### Backend Issues

**Port Already in Use:**
```powershell
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

**Module Import Errors:**
```powershell
# Ensure you're in backend directory
cd backend
# Install dependencies
pip install -r requirements.txt
```

**Environment Variables Not Loaded:**
```powershell
# Install python-dotenv
pip install python-dotenv
# Verify .env file exists and has correct format
```

### Frontend Issues

**CORS Errors:**
- Ensure `ALLOWED_ORIGINS` in backend `.env` includes `http://localhost:3000`
- Verify backend CORS middleware configuration

**API Connection Failed:**
- Check `BACKEND_URL` in frontend `.env.local`
- Ensure backend server is running
- Verify firewall/antivirus isn't blocking connections

**Build Errors:**
```powershell
# Clear Next.js cache
rm -rf .next
npm run build
```

### Database Issues

**RLS Policy Errors:**
- Temporarily disable RLS for testing
- Use service role key for backend operations
- Verify policy conditions

**Connection Pool Exhausted:**
- Restart Supabase project
- Check for unclosed connections in code
- Implement connection pooling

## 📊 Performance Testing

### Load Testing Backend
```powershell
# Install Apache Bench
# Test path generation endpoint
ab -n 100 -c 10 -H "Content-Type: application/json" -p test_data.json http://localhost:8000/api/generate-path
```

### Database Performance
```sql
-- Check query performance in Supabase
EXPLAIN ANALYZE SELECT * FROM paths WHERE user_id = 'test_user';
```

## 🚀 Deployment Testing

### Docker Testing
```powershell
# Build and run backend container
cd backend
docker build -t pathmentor-backend .
docker run -p 8000:8000 pathmentor-backend

# Build and run frontend container
cd frontend
docker build -t pathmentor-frontend .
docker run -p 3000:3000 pathmentor-frontend
```

### Production Environment Testing
1. Deploy to staging environment
2. Run integration tests against staging
3. Verify SSL certificates
4. Test with production data volumes
5. Monitor performance metrics

## 📈 Monitoring and Logging

### Backend Logs
```powershell
# View logs in real-time
tail -f backend.log

# Check specific log levels
grep "ERROR" backend.log
```

### Database Monitoring
- Monitor Supabase dashboard for connection counts
- Check query performance metrics
- Set up alerts for error rates

### Frontend Monitoring
- Use browser developer tools
- Monitor Network tab for API calls
- Check Console for JavaScript errors

## ✅ Test Checklist

- [ ] Backend database connection successful
- [ ] All CRUD operations working
- [ ] Backend API server starts without errors
- [ ] API health check returns success
- [ ] Frontend connects to backend API
- [ ] Learning path generation works end-to-end
- [ ] Feedback submission works
- [ ] Error handling gracefully manages failures
- [ ] Performance meets requirements
- [ ] Security measures are in place

## 🔄 Continuous Testing

Set up automated testing:

1. **GitHub Actions** for CI/CD
2. **Database migration testing**
3. **API contract testing**
4. **Performance regression testing**
5. **Security vulnerability scanning**

## 📞 Getting Help

If you encounter issues:

1. Check the logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure all services are running
4. Check network connectivity
5. Review the troubleshooting sections above

For additional support, check:
- Backend API documentation at `http://localhost:8000/docs`
- Supabase dashboard for database issues
- Browser developer tools for frontend issues
