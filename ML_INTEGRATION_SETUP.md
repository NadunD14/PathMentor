# Frontend-Backend ML Integration Setup Guide (Supabase Edition)

This guide explains how to set up the complete integration between the frontend questionnaire system and the backend ML analysis service using Supabase as the primary database.

## Overview

When a user completes the questionnaire setup, the system now:

1. **Frontend**: Triggers ML analysis via `/api/ml/complete-setup`
2. **Frontend API**: Fetches user data from Supabase and calls backend ML service
3. **Backend ML Service**: Connects directly to Supabase to analyze user responses
4. **Backend**: Generates personalized recommendations and creates learning paths
5. **Frontend**: Displays completion status and next steps

## Setup Instructions

### 1. Supabase Configuration (REQUIRED)

Both frontend and backend connect to the same Supabase instance:

#### Get Your Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (for frontend)
   - **Service Role Key** (for backend - keep this secret!)

### 2. Backend Configuration

#### Environment Variables
Copy the backend `.env.example` to `.env` and configure:

```bash
# REQUIRED Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# FastAPI Configuration
SECRET_KEY=your-secret-key-here
BACKEND_CORS_ORIGINS=http://localhost:3000

# ML Models (Optional - will use fallback if not available)
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Test Setup
```bash
cd backend
python test_setup.py
```

#### Start Backend Server
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Configuration

#### Environment Variables
Copy the frontend `.env` file and ensure:

```bash
# REQUIRED Supabase Configuration (same as backend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API Configuration
BACKEND_URL=http://localhost:8000
```

#### Start Frontend Server
```bash
cd frontend
npm run dev
```

## Database Schema Requirements

Your Supabase database should have these tables (as provided in your schema):

### Core Tables
- `users` - User authentication and profiles (Supabase Auth)
- `categories` - Learning categories  
- `general_questions` - Questions for assessment
- `question_options` - Multiple choice options
- `user_answers` - User responses to questions
- `user_category_selections` - User's chosen categories

### Learning Path Tables
- `paths` - Learning paths for each category
- `tasks` - Individual learning tasks within paths
- `user_progress` - Progress tracking for users

## Testing the Integration

### 1. Backend Health Check
Visit these endpoints to test:
- `http://localhost:8000/api/v1/health` - Basic health
- `http://localhost:8000/api/v1/health/database` - Supabase connection
- `http://localhost:8000/api/v1/health/ml` - ML service status

### 2. Complete Questionnaire Flow
1. Start both frontend and backend
2. Navigate to `/user/progress/questions`
3. Complete the questionnaire
4. Watch the complete page trigger ML analysis

### 3. Check Logs
- **Backend**: Watch terminal for Supabase connection logs
- **Frontend**: Check browser console for API responses

## Flow Description

### 1. User Completes Questionnaire
- User answers general and category-specific questions
- Answers are saved to Supabase via frontend API routes
- User reaches completion page

### 2. ML Analysis Triggered
- Complete page calls `/api/ml/complete-setup`
- Frontend API fetches user data from Supabase
- Backend receives structured data for analysis

### 3. Backend Processing
- Backend connects to Supabase directly using service role key
- Analyzes text complexity, learning patterns, preferences
- Generates personalized insights and recommendations

### 4. Results Storage
- Creates initial learning paths in Supabase
- Sets up progress tracking
- Returns analysis to frontend

## Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   ```bash
   # Test connection
   cd backend
   python test_setup.py
   ```
   - Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   - Check Supabase project is active
   - Ensure service role key has proper permissions

2. **CORS Errors**
   - Add your frontend URL to `BACKEND_CORS_ORIGINS`
   - Check Supabase RLS policies allow your operations

3. **ML Models Not Loading**
   - Models will use fallback mode if not available
   - For production, install: `pip install sentence-transformers torch`
   - Check `/api/v1/health/ml` endpoint

4. **Frontend API Errors**
   - Verify `BACKEND_URL` in frontend `.env`
   - Check backend server is running on port 8000
   - Ensure both frontend and backend use same Supabase project

### Debug Mode

Enable detailed logging:

**Backend:**
```bash
# In backend/.env
LOG_LEVEL=DEBUG
```

**Frontend:**
```javascript
// In browser console
localStorage.setItem('debug', 'pathmentor:*')
```

## Deployment Considerations

### Production Setup
1. **Supabase**: Already production-ready
2. **Backend**: Deploy to Railway, Render, or similar
3. **Frontend**: Deploy to Vercel, Netlify, etc.

### Environment Variables
- Use production Supabase project
- Set strong `SECRET_KEY` for backend
- Update `BACKEND_CORS_ORIGINS` with production URLs
- Configure `BACKEND_URL` to point to deployed backend

### Security
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend
- Use Supabase RLS (Row Level Security) for data protection
- Enable Supabase audit logs for monitoring

## Key Advantages of Supabase Integration

✅ **Unified Database**: Frontend and backend use same database  
✅ **Real-time Ready**: Supabase supports real-time subscriptions  
✅ **Built-in Auth**: User authentication handled by Supabase  
✅ **Automatic APIs**: Supabase provides REST and GraphQL APIs  
✅ **Scalable**: Supabase handles scaling automatically  
✅ **Backup & Recovery**: Built-in database backup features  

## Next Steps

After successful setup:
1. ✅ Complete a test questionnaire
2. ✅ Verify ML analysis runs successfully  
3. ✅ Check user progress is created in database
4. 🚀 Customize ML algorithms for your specific needs
5. 🚀 Add more sophisticated learning path generation
6. 🚀 Implement real-time progress updates

## Flow Description

### 1. User Completes Questionnaire
- User answers general and category-specific questions
- Answers are saved to Supabase via frontend API routes
- User reaches the completion page (`/user/progress/questions/complete`)

### 2. ML Analysis Triggered
- Complete page automatically calls `/api/ml/complete-setup`
- Frontend API fetches user data from Supabase:
  - User answers with question details
  - Selected categories
  - User preferences

### 3. Backend Processing
- Frontend API calls backend ML service: `POST /api/v1/ml/complete-setup`
- Backend analyzes:
  - Text complexity of answers
  - Multiple choice patterns
  - Learning style preferences
  - Overall readiness score

### 4. Personalized Recommendations
- Backend generates:
  - Strengths and weaknesses analysis
  - Learning recommendations
  - Estimated completion times
  - Initial learning paths

### 5. Progress Initialization
- Backend creates initial progress tracking
- Sets up learning paths based on selected categories
- Prepares adaptive recommendations

## API Endpoints

### Frontend API Routes

#### POST `/api/ml/complete-setup`
Triggers the complete ML analysis process.

**Request Body:**
```json
{
  "userId": "uuid-string"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "user_id": "uuid",
    "overall_score": 0.75,
    "strengths": ["Strong analytical thinking", "Good written communication"],
    "weaknesses": ["Could expand on detailed explanations"],
    "recommendations": ["Mix theoretical and practical content"],
    "learning_velocity": 0.8,
    "completion_prediction": 14
  },
  "message": "Setup completed and ML analysis performed successfully"
}
```

### Backend API Routes

#### POST `/api/v1/ml/complete-setup`
Performs comprehensive ML analysis of user's questionnaire responses.

**Request Body:**
```json
{
  "user_id": "uuid-string",
  "answers": [
    {
      "question_id": 1,
      "answer_text": "I prefer hands-on learning...",
      "option_id": null,
      "category_id": 1
    }
  ],
  "selected_categories": [
    {
      "category_id": 1,
      "categories": {
        "name": "Python Programming",
        "description": "Learn Python basics"
      }
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Database Schema Requirements

The integration expects the following Supabase tables to be set up:

### Core Tables
- `users` - User authentication and profiles
- `categories` - Learning categories
- `general_questions` - Questions for assessment
- `question_options` - Multiple choice options
- `user_answers` - User responses to questions
- `user_category_selections` - User's chosen categories

### ML-Enhanced Tables
- `paths` - Learning paths for each category
- `tasks` - Individual learning tasks within paths
- `user_progress` - Progress tracking for users
- `user_task_feedback` - User feedback on tasks

## ML Analysis Features

### Text Analysis
- **Complexity Scoring**: Analyzes word count, sentence structure, vocabulary
- **Content Quality**: Evaluates depth and thoughtfulness of responses
- **Learning Style Detection**: Identifies reflective, practical, or balanced learners

### Pattern Recognition
- **Response Consistency**: Tracks answer patterns across questions
- **Confidence Assessment**: Measures decision-making confidence
- **Difficulty Preference**: Determines optimal challenge level

### Personalization
- **Adaptive Pathways**: Creates custom learning sequences
- **Time Estimation**: Predicts completion timeframes
- **Strength-Based Routing**: Leverages user's existing skills

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check if backend server is running on port 8000
   - Verify `BACKEND_URL` in frontend `.env`
   - Ensure CORS is properly configured

2. **Supabase Authentication Error**
   - Verify Supabase credentials in both frontend and backend
   - Check service role key permissions
   - Ensure database tables exist

3. **ML Analysis Timeout**
   - Check if sentence-transformers model is downloading
   - Verify sufficient memory for ML models
   - Consider using lighter models for development

### Debug Mode

Enable debug logging by setting:
```bash
# Backend
LOG_LEVEL=DEBUG

# Frontend (in browser console)
localStorage.setItem('debug', 'pathmentor:*')
```

## Next Steps

After successful setup:

1. **Test the Flow**: Complete a questionnaire to verify ML integration
2. **Monitor Logs**: Check both frontend and backend logs for errors
3. **Customize Analysis**: Modify ML algorithms based on your specific needs
4. **Scale Infrastructure**: Consider cloud deployment for production use

## Production Considerations

- Use production-grade Supabase instance
- Deploy backend with proper scaling (Kubernetes, Docker)
- Implement caching for ML model inference
- Add monitoring and error tracking
- Secure API endpoints with authentication
- Optimize ML models for inference speed
