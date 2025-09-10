# PathMentor Backend API

A FastAPI-based backend service for generating personalized learning paths by fetching and ranking resources from YouTube, Udemy, and Reddit.

## Features

- **Personalized Learning Paths**: Generate custom learning paths based on user profile (goal, experience level, topic, learning style)
- **Multi-Source Content**: Fetches resources from YouTube, Udemy, and Reddit
- **Intelligent Ranking**: Uses a ranking system to prioritize the most relevant and high-quality resources
- **Structured Output**: Returns well-organized learning paths with steps, objectives, and prerequisites
- **Database Integration**: Stores generated paths in Supabase for future retrieval
- **RESTful API**: Clean, documented endpoints for frontend integration

## Architecture

```
/backend
├── main.py                  # FastAPI app setup & main router
├── models.py               # Pydantic models for request/response
├── database.py             # Connection logic to Supabase
├── services/               # Core business logic
│   ├── query_generator.py  # Rule-based query generation
│   ├── scraper_manager.py  # Orchestrates calls to external APIs
│   ├── ranking_service.py  # Resource ranking and filtering
│   └── path_builder.py     # Assembles final learning path structure
├── clients/                # External API clients
│   ├── youtube_client.py   # YouTube Data API integration
│   ├── udemy_client.py     # Udemy API integration (mock data)
│   └── reddit_client.py    # Reddit API integration
├── utils/                  # Helper functions
│   └── text_cleaner.py     # Text processing utilities
└── requirements.txt        # Python dependencies
```

## Installation

1. **Clone the repository and navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your API keys:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

5. **Run the application**:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### Core Endpoints

- **POST `/api/generate-learning-path`**: Generate a personalized learning path
- **GET `/api/learning-path/{path_id}`**: Retrieve a specific learning path
- **GET `/api/user/{user_id}/learning-paths`**: Get all paths for a user

### Utility Endpoints

- **POST `/api/search-resources`**: Search for resources from specific sources
- **GET `/api/statistics`**: Get API usage statistics
- **GET `/health`**: Health check endpoint

### API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Usage Example

### Generate Learning Path

```bash
curl -X POST "http://localhost:8000/api/generate-learning-path" \
  -H "Content-Type: application/json" \
  -d '{
    "user_profile": {
      "goal": "skill_building",
      "experience_level": "beginner",
      "topic": "React",
      "learning_style": "hands_on",
      "time_commitment": 10,
      "user_id": "user_123"
    }
  }'
```

### Response Format

```json
{
  "success": true,
  "learning_path": {
    "path_id": "unique-path-id",
    "title": "React Learning Path for Beginner (Skill Building)",
    "description": "A comprehensive beginner-level learning path for React...",
    "total_duration": "6-10 weeks",
    "difficulty_level": "beginner",
    "steps": [
      {
        "step_number": 1,
        "title": "Introduction and Fundamentals",
        "description": "Get familiar with basic concepts",
        "estimated_duration": "1-2 weeks",
        "resources": [...],
        "learning_objectives": [...],
        "prerequisites": []
      }
    ]
  },
  "message": "Successfully generated learning path with 15 resources",
  "path_id": "unique-path-id"
}
```

## External API Setup

### YouTube Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to your `.env` file

### Supabase Database

1. Create a [Supabase](https://supabase.com/) account
2. Create a new project
3. Get your project URL and anon key
4. Create the required tables (see Database Schema below)

### Reddit API (Optional)

The Reddit client uses public JSON endpoints by default, but you can optionally set up OAuth:

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Create a new application
3. Add credentials to `.env` file

## Database Schema

### Learning Paths Table

```sql
CREATE TABLE learning_paths (
  id SERIAL PRIMARY KEY,
  path_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255),
  topic VARCHAR(255) NOT NULL,
  goal VARCHAR(100),
  experience_level VARCHAR(50),
  learning_style VARCHAR(50),
  title TEXT NOT NULL,
  description TEXT,
  total_duration VARCHAR(100),
  difficulty_level VARCHAR(50),
  steps_count INTEGER,
  path_data JSONB NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX idx_learning_paths_topic ON learning_paths(topic);
CREATE INDEX idx_learning_paths_created_at ON learning_paths(created_at);
```

### Search Logs Table (Optional)

```sql
CREATE TABLE search_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  query TEXT NOT NULL,
  source VARCHAR(50),
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);
```

## Development

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Formatting

```bash
# Install formatting tools
pip install black isort

# Format code
black .
isort .
```

### Adding New Resource Sources

1. Create a new client in `/clients/` directory
2. Implement the required interface methods
3. Add the client to `ScraperManager`
4. Update query generation logic if needed

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `YOUTUBE_API_KEY` | YouTube Data API key | No (uses mock data) |
| `UDEMY_API_KEY` | Udemy API key | No (uses mock data) |
| `REDDIT_CLIENT_ID` | Reddit app client ID | No |
| `REDDIT_CLIENT_SECRET` | Reddit app secret | No |

## Troubleshooting

### Common Issues

1. **Module Import Errors**: Make sure you're in the backend directory and have activated the virtual environment
2. **Database Connection Issues**: Verify your Supabase credentials in the `.env` file
3. **API Rate Limits**: YouTube API has quotas; consider implementing caching for production
4. **CORS Issues**: Ensure your frontend URL is in the `ALLOWED_ORIGINS` list

### Logging

The application logs errors to the console. In production, consider implementing structured logging:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

## Production Deployment

### Docker Support

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Configuration

For production, set these additional environment variables:

```env
FASTAPI_ENV=production
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is part of the PathMentor learning platform.
