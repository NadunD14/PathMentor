# PathMentor Backend

AI-powered personalized learning path generation service built with FastAPI.

## Overview

PathMentor backend is a sophisticated service that generates personalized learning paths by orchestrating between:

- **RL Service**: Pre-trained reinforcement learning model for platform recommendations
- **LLM Service**: OpenAI GPT integration for query generation and path synthesis  
- **Scrapers**: External API clients for fetching resources from YouTube, Udemy, Reddit
- **Database**: Supabase integration for user profiles, paths, and feedback storage

## Architecture

```
backend/
├── api/                    # FastAPI application
│   ├── main.py            # Application entry point
│   ├── dependencies.py    # Dependency injection
│   └── endpoints/         # API endpoints
│       ├── generate_path.py  # Main learning path generation
│       └── feedback.py       # User feedback collection
├── database/              # Database layer
│   ├── models.py         # Pydantic models
│   ├── supabase_client.py # Supabase client
│   └── repositories/      # Data access layer
├── llm_service/           # LLM integration
│   ├── client.py         # OpenAI client
│   ├── prompts/          # Prompt templates
│   └── fine_tuner/       # Model fine-tuning (future)
├── rl_service/            # Reinforcement Learning
│   ├── predictor.py      # Platform recommendation model
│   ├── model.py          # RL model definitions
│   └── train.py          # Model training scripts
└── scrapers/              # External API clients
    ├── youtube_client.py  # YouTube API integration
    ├── udemy_client.py    # Udemy API integration
    └── reddit_scraper.py  # Reddit API integration
```

## Features

### 🎯 Personalized Learning Paths
- Analyzes user profile (experience level, learning style, goals)
- Generates custom learning sequences with 4-8 structured steps
- Matches content to individual learning preferences

### 🤖 AI-Powered Recommendations
- **RL Model**: Recommends optimal learning platforms based on user characteristics
- **LLM Integration**: Generates targeted search queries and synthesizes coherent learning paths
- **Smart Filtering**: Selects best resources based on quality, relevance, and difficulty

### 📚 Multi-Platform Resource Aggregation
- **YouTube**: Video tutorials and courses
- **Udemy**: Structured online courses  
- **Reddit**: Community discussions and Q&A
- Extensible architecture for adding more platforms

### 📊 Feedback & Analytics
- Tracks user interactions (completed, skipped, bookmarked, etc.)
- Collects ratings and feedback for continuous improvement
- Analytics on learning patterns and content effectiveness

## API Endpoints

### Learning Path Generation
```http
POST /api/v1/generate-path
```

Generate a personalized learning path based on user profile and topic.

**Request Body:**
```json
{
  "user_profile": {
    "goal": "Learn web development",
    "experience_level": "beginner",
    "learning_style": "visual"
  },
  "topic": "React.js",
  "duration_preference": "2 weeks",
  "platform_preferences": ["youtube", "udemy"]
}
```

**Response:**
```json
{
  "success": true,
  "learning_path": {
    "id": "path_123",
    "title": "Personalized Learning Path: React.js",
    "description": "A customized learning journey...",
    "total_duration": "40 hours",
    "difficulty": "beginner",
    "steps": [
      {
        "step_number": 1,
        "title": "React Fundamentals",
        "description": "Learn the core concepts...",
        "resources": [...],
        "estimated_duration": "8 hours",
        "learning_objectives": ["Understand JSX", "Create components"]
      }
    ]
  },
  "path_id": "path_123"
}
```

### Feedback Collection
```http
POST /api/v1/feedback/submit
```

Submit user feedback on learning resources.

**Request Body:**
```json
{
  "path_id": "path_123",
  "resource_id": "youtube_abc123",
  "interaction_type": "completed",
  "rating": 5,
  "comment": "Excellent tutorial!"
}
```

## Setup & Installation

### Prerequisites
- Python 3.11+
- Supabase account
- OpenAI API key
- Optional: YouTube, Udemy, Reddit API credentials

### Environment Variables
Copy `.env.template` to `.env` and configure:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# External APIs (optional)
YOUTUBE_API_KEY=your_youtube_api_key
UDEMY_CLIENT_ID=your_udemy_client_id
UDEMY_CLIENT_SECRET=your_udemy_client_secret
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up database tables in Supabase:**
   ```sql
   -- Create tables based on models in database/models.py
   -- See database/init.sql for complete schema
   ```

3. **Run the application:**
   ```bash
   # Development
   uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
   
   # Production
   gunicorn backend.api.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Docker Deployment

```bash
# Build image
docker build -t pathmentor-backend .

# Run container
docker run -p 8000:8000 --env-file .env pathmentor-backend
```

## Database Schema

### User Profiles
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    learning_style TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Generated Paths
```sql
CREATE TABLE generated_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    path_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Feedback
```sql
CREATE TABLE user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id UUID REFERENCES generated_paths(id),
    resource_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Models & Types

### Learning Styles
- `visual`: Prefers visual content (videos, diagrams)
- `auditory`: Prefers audio content (podcasts, lectures)
- `kinesthetic`: Prefers hands-on practice (projects, labs)
- `reading_writing`: Prefers text-based content (articles, docs)
- `multimodal`: Mix of all learning styles

### Experience Levels
- `beginner`: New to the topic
- `intermediate`: Some experience, building skills
- `advanced`: Proficient, learning advanced concepts
- `expert`: Deep expertise, learning cutting-edge topics

### Interaction Types
- `completed`: User finished the resource
- `skipped`: User skipped without engaging
- `bookmarked`: User saved for later
- `started`: User began but didn't finish
- `liked`/`disliked`: User rating feedback

## Development

### Project Structure
The backend follows a clean architecture pattern:

- **API Layer**: FastAPI endpoints and routing
- **Service Layer**: Business logic (RL, LLM services)
- **Repository Layer**: Data access abstractions
- **Model Layer**: Pydantic models for type safety

### Adding New Platforms
To add support for a new learning platform:

1. Create a new scraper in `scrapers/new_platform_client.py`
2. Add platform enum to `database/models.py`
3. Update `generate_path.py` to include the new scraper
4. Add platform-specific logic to RL predictor

### Testing
```bash
# Run tests
pytest

# Run with coverage
pytest --cov=backend tests/
```

## Production Considerations

### Security
- Use environment variables for all secrets
- Implement proper authentication/authorization
- Add rate limiting to prevent abuse
- Validate and sanitize all inputs

### Performance
- Implement caching for expensive operations
- Use connection pooling for database
- Consider async processing for long-running tasks
- Monitor API response times

### Monitoring
- Add structured logging
- Implement health checks
- Monitor external API usage and quotas
- Track user feedback and model performance

## Future Enhancements

- **Model Training**: Implement RL model training pipeline
- **Caching**: Redis integration for performance
- **Authentication**: JWT-based user authentication
- **Analytics**: Advanced learning analytics dashboard
- **Recommendations**: Collaborative filtering for content discovery
- **Multi-language**: Support for multiple languages
- **Mobile API**: Optimized endpoints for mobile apps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
