# PathMentor Backend

FastAPI backend service for PathMentor learning platform with ML analysis capabilities.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Supabase project with PathMentor schema

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Test Configuration
```bash
python test_setup.py
```

### 4. Start Server
```bash
uvicorn app.main:app --reload --port 8000
```

## 🔗 API Endpoints

### Health Checks
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/database` - Supabase connection test
- `GET /api/v1/health/ml` - ML service status

### ML Analysis
- `POST /api/v1/ml/complete-setup` - Process questionnaire completion
- `POST /api/v1/ml/recommendations` - Get learning recommendations
- `POST /api/v1/ml/analyze-progress` - Analyze user progress

### Documentation
- Visit `http://localhost:8000/docs` for interactive API documentation

## 🧠 ML Features

- **Text Analysis**: Evaluates complexity and depth of user responses
- **Learning Style Detection**: Identifies user learning preferences
- **Personalized Recommendations**: Generates custom learning paths
- **Progress Prediction**: Estimates completion timeframes
- **Adaptive Pathways**: Creates tailored learning sequences

## 🛠️ Development

### Project Structure
```
app/
├── api/            # API routes
├── core/           # Configuration
├── services/       # Business logic
├── schemas/        # Pydantic models
└── main.py         # FastAPI application
```

### Adding New Features
1. Create schemas in `schemas/`
2. Add business logic to `services/`
3. Create API endpoints in `api/`
4. Update router in `api/api_v1/api.py`

## 🔧 Configuration

### Required Environment Variables
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SECRET_KEY=your-secret-key
```

### Optional Configuration
```bash
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
BACKEND_CORS_ORIGINS=http://localhost:3000
ML_MODEL_PATH=./models
```

## 📊 Database Integration

The backend connects directly to Supabase using the REST API:
- User answers and questionnaire data
- Learning paths and progress tracking
- Categories and questions management

## 🚀 Deployment

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway deploy
```

### Docker
```bash
# Build image
docker build -t pathmentor-backend .

# Run container
docker run -p 8000:8000 pathmentor-backend
```

## 🔍 Troubleshooting

### Common Issues

1. **Import Errors**: Install dependencies with `pip install -r requirements.txt`
2. **Supabase Connection**: Check credentials and network connectivity
3. **ML Models**: Models use fallback mode if not available
4. **CORS Issues**: Update `BACKEND_CORS_ORIGINS` in environment

### Debug Mode
Set `LOG_LEVEL=DEBUG` in environment for detailed logging.

## 📝 License

Part of the PathMentor project.
