# PathMentor Backend - Reorganized Structure and Path Creation Flow

## 🎯 Overview

The PathMentor backend has been completely reorganized into a clean, modular, and maintainable structure following industry best practices. All functionality is properly separated into logical components with clear responsibilities.

## 📁 New Folder Structure

```
backend_new/
├── app/                          # Application entry point and configuration
│   ├── __init__.py
│   ├── main.py                   # FastAPI app setup and configuration
│   └── dependencies.py          # Dependency injection setup
├── api/                          # API layer - all endpoints organized here
│   ├── __init__.py
│   ├── router.py                 # Main API router configuration
│   └── v1/                       # API version 1
│       ├── __init__.py
│       └── endpoints/
│           ├── __init__.py
│           ├── health.py         # Health check endpoint
│           ├── learning_paths.py # Main path generation endpoint
│           └── feedback.py       # Feedback submission endpoint
├── models/                       # All data models in one place
│   ├── __init__.py
│   ├── schemas.py               # Pydantic schemas for API requests/responses
│   └── database.py              # Database models matching Supabase schema
├── database/                     # Database layer - connections and repositories
│   ├── __init__.py
│   ├── connection.py            # Database connection management
│   └── repositories/
│       ├── __init__.py
│       ├── base.py              # Base repository with common CRUD operations
│       ├── user.py              # User-related database operations
│       └── feedback.py          # Feedback, paths, and tasks repositories
├── services/                     # Business logic and external services
│   ├── __init__.py
│   ├── llm/                     # LLM service for AI generation
│   │   ├── __init__.py
│   │   ├── client.py            # LLM service implementation
│   │   └── prompts/
│   │       ├── query_gen.txt    # Search query generation prompt
│   │       └── path_synth.txt   # Learning path synthesis prompt
│   ├── ml/                      # Machine Learning services
│   │   ├── __init__.py
│   │   └── predictor.py         # ML-based platform recommendations
│   └── scrapers/                # External content scrapers
│       ├── __init__.py
│       ├── youtube.py           # YouTube video scraper
│       ├── udemy.py             # Udemy course scraper
│       └── reddit.py            # Reddit discussion scraper
├── core/                        # Core utilities and configuration
│   ├── __init__.py
│   ├── config.py                # Application configuration settings
│   └── logging.py               # Logging configuration
├── tests/                       # Test files (organized same as main code)
├── main.py                      # Application entry point
├── requirements.txt             # Python dependencies
└── .env                         # Environment variables
```

## 🚀 Path Creation Flow

### 1. API Request Entry Point
**File**: `api/v1/endpoints/learning_paths.py` - `generate_learning_path()`

The flow starts when a user makes a POST request to `/api/v1/learning-paths/generate` with:
```json
{
  "user_profile": {
    "goal": "Learn React.js",
    "experience_level": "beginner",
    "learning_style": "visual"
  },
  "topic": "React.js",
  "duration_preference": "2 weeks",
  "platform_preferences": ["youtube", "udemy"]
}
```

### 2. Platform Recommendation (ML Service)
**File**: `services/ml/predictor.py` - `MLPredictor.predict_platforms()`

The ML predictor analyzes the user profile and returns recommended platforms:
- **Input**: User profile, topic, optional platform preferences
- **Process**: 
  - Calculates platform scores based on learning style and experience level
  - Visual learners get higher YouTube scores
  - Beginners get higher YouTube/Udemy scores
  - Advanced users get higher GitHub/Medium scores
- **Output**: List of `PlatformRecommendation` objects with confidence scores

### 3. Search Query Generation (LLM Service)
**File**: `services/llm/client.py` - `LLMService.generate_search_queries()`

The LLM service generates targeted search queries for each platform:
- **Input**: User profile, topic, recommended platforms
- **Process**: 
  - Uses Groq API with custom prompts (`services/llm/prompts/query_gen.txt`)
  - Generates 3-5 specific search queries per platform
  - Considers user's experience level and learning style
- **Output**: List of `SearchQuery` objects with platform-specific queries

### 4. Resource Collection (Scraper Services)
**Files**: `services/scrapers/youtube.py`, `services/scrapers/udemy.py`, `services/scrapers/reddit.py`

Each scraper fetches resources from their respective platforms:

#### YouTube Scraper
- **Input**: Search queries for YouTube
- **Process**: 
  - Uses YouTube Data API v3 (or mock data if no API key)
  - Searches for videos matching the queries
  - Estimates duration and difficulty from video titles
- **Output**: List of `Resource` objects with video details

#### Udemy Scraper
- **Input**: Search queries for Udemy
- **Process**: 
  - Uses mock data (Udemy API requires partner access)
  - Generates course-like results with realistic titles and descriptions
- **Output**: List of `Resource` objects representing courses

#### Reddit Scraper
- **Input**: Search queries for Reddit
- **Process**: 
  - Uses Reddit's public API to search relevant subreddits
  - Finds discussions and Q&A posts related to the topic
  - Scores posts based on upvotes and comments
- **Output**: List of `Resource` objects with discussion links

### 5. Learning Path Synthesis (LLM Service)
**File**: `services/llm/client.py` - `LLMService.synthesize_learning_path()`

The LLM creates a structured learning path from all collected resources:
- **Input**: User profile, topic, collected resources, duration preference
- **Process**:
  - Uses custom prompt (`services/llm/prompts/path_synth.txt`)
  - Organizes resources into 4-8 logical learning steps
  - Ensures progression from basic to advanced concepts
  - Matches user's learning style and experience level
- **Output**: Complete `LearningPath` object with structured steps

### 6. Database Storage (Repository Layer)
**Files**: `database/repositories/feedback.py` - `PathRepository` and `TaskRepository`

The generated path is saved to the database:
- **Path Storage**: 
  - Creates entry in `paths` table with metadata
  - Links to user via `user_id`
  - Sets status as "in-progress"
- **Task Storage**:
  - Creates individual tasks for each resource in the path
  - Maintains proper order via `task_order` field
  - Links tasks to the parent path via `path_id`

### 7. Response Formation
**File**: `api/v1/endpoints/learning_paths.py`

The endpoint returns a structured response:
```json
{
  "success": true,
  "learning_path": {
    "title": "Learn React.js",
    "description": "Complete learning path for React.js",
    "total_duration": "2 weeks",
    "difficulty": "beginner",
    "steps": [...]
  },
  "message": "Successfully generated learning path for React.js",
  "path_id": "123"
}
```

## 🔄 Key Improvements in New Structure

### 1. **Separation of Concerns**
- **API Layer**: Pure request/response handling
- **Services Layer**: Business logic and external integrations
- **Database Layer**: Data access and persistence
- **Models Layer**: Data structures and validation

### 2. **Dependency Injection**
- All services are injected via FastAPI's dependency system
- Easy to mock for testing
- Centralized configuration in `app/dependencies.py`

### 3. **Error Handling**
- Graceful degradation when external APIs fail
- Fallback mechanisms for each service
- Comprehensive logging throughout the flow

### 4. **Scalability**
- Easy to add new platforms by creating new scraper services
- LLM prompts are externalized and easily modifiable
- Database operations are abstracted through repositories

### 5. **Configuration Management**
- All settings centralized in `core/config.py`
- Environment-based configuration
- Type-safe settings with Pydantic

## 🛠 How to Use the New Structure

### 1. **Adding a New Platform**
1. Create new scraper in `services/scrapers/new_platform.py`
2. Add platform enum to `models/schemas.py`
3. Update ML predictor logic in `services/ml/predictor.py`
4. Add platform handling in `api/v1/endpoints/learning_paths.py`

### 2. **Modifying LLM Prompts**
1. Edit files in `services/llm/prompts/`
2. No code changes required - prompts are loaded dynamically

### 3. **Adding New Endpoints**
1. Create new file in `api/v1/endpoints/`
2. Add router to `api/v1/__init__.py`
3. Include in main router in `api/router.py`

### 4. **Database Changes**
1. Update models in `models/database.py`
2. Add repository methods in appropriate repository class
3. Update API endpoints to use new methods

## 🎯 Benefits of the Reorganization

1. **Maintainability**: Clear structure makes it easy to find and modify code
2. **Testability**: Each component can be tested independently
3. **Scalability**: Easy to add new features without breaking existing code
4. **Readability**: Logical organization makes code self-documenting
5. **Reusability**: Services can be reused across different endpoints
6. **Standards Compliance**: Follows FastAPI and Python best practices

This reorganized structure transforms the backend from a collection of scattered files into a professional, maintainable, and scalable application that follows industry standards and best practices.