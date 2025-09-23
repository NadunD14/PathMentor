Sure! Here's a README.md file version that you can add to your repository:

markdown
Copy
Edit
# PathMentor

An AI-powered platform that helps users discover effective learning paths based on goals, preferences, and learning styles. This single README consolidates all project documentation from the repository (Progress Flow, Learning Type Assessment, Database setup, and root docs).

## Monorepo structure

```
.
├── backend_new/               # FastAPI backend service
│   ├── app/                   # FastAPI app (routers, services)
│   ├── core/                  # Config and logging
│   ├── database/              # DB connection and repositories
│   ├── models/                # Pydantic and DB models
│   ├── services/              # LLM/ML + scrapers
│   ├── tests/                 # Backend tests
│   └── requirements.txt
├── frontend/                  # Next.js 15 app router frontend
│   └── src/
│       ├── app/               # Pages, APIs and routes
│       ├── components/        # UI components
│       ├── contexts/          # React contexts (Auth)
│       └── lib/               # Services, store, helpers
├── database/                  # SQL seeds/migrations
│   └── users_table.sql
├── docker-compose.yml         # Optional container orchestration
├── Dockerfile                 # Base image (if used)
```

## Key features

- Personalized learning paths from user signals (category, time, goals, style)
- Supabase Auth for secure sign-up/login and session management
- Database-driven questionnaire flow (categories, general + category-specific questions)
- Learning Type Assessment (visual, auditory, kinesthetic, reading/writing)
- Real-time progress tracking and resumable state (Zustand/localStorage)
- FastAPI backend with LLM/ML hooks and content scrapers (YouTube, Udemy, Reddit)

## Tech stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 4, Zustand, Supabase JS
- Backend: FastAPI, Uvicorn, Pydantic, httpx/aiohttp, Supabase (Python), Groq SDK
- Data/DB: Supabase (PostgreSQL) with RLS and custom tables
- Tooling: ESLint, Black, Flake8, PyTest

---

## Progress questionnaire flow (database-driven)

The flow is fully powered by Supabase tables and exposed via Next.js route handlers.

1) Category selection → 2) General questions → 3) Category-specific questions → 4) Completion

Tables
- categories
- general_questions (includes both general and category-specific)
- question_options
- category_questions (link table)
- user_answers
- user_category_selections

API endpoints (frontend route handlers)
- GET /api/categories – list categories
- POST /api/categories – create category (admin)
- GET /api/questions?type=general – general questions
- GET /api/questions/category?categoryId=<id> – category-specific questions
- POST /api/answers – save answers
- GET /api/answers?userId=<id> – fetch answers
- POST /api/user-category-selection – save selection
- GET /api/user-category-selection?userId=<id> – get selection

State (Zustand)
- Selected category (+ id), current step, fetched questions, answers, navigation state, localStorage persistence

File structure (frontend excerpt)
```
src/app/
├─ api/
│  ├─ categories/route.ts
│  ├─ questions/route.ts
│  ├─ questions/category/route.ts
│  ├─ answers/route.ts
│  └─ user-category-selection/route.ts
└─ user/(authenticated)/progress/questions/
    ├─ page.tsx            # Category selection
    ├─ general/page.tsx    # General questions
    ├─ category/page.tsx   # Category-specific
    └─ complete/page.tsx   # Completion
```

Key characteristics
- Database-driven and dynamic, easy to extend without code changes
- Real-time persistence to Supabase; resumable client state
- Supports both multiple-choice and text inputs

---

## Learning Type Assessment (overview)

Determines primary learning type: Visual, Auditory, Kinesthetic, or Reading/Writing through interactive activities and tracked metrics.

Frontend components (high level)
- LearningTypeAssessment.tsx (orchestrator)
- LearningTypeResult.tsx, AssessmentProgress.tsx, ActivitySelector.tsx
- Activities: MemoryChallengeActivity, ProblemSolvingActivity, AudioVisualActivity, ReadingWritingActivity
- Store/services: useLearningTypeStore (Zustand), learningTypeService

Backend endpoints (conceptual, under /api/v1/learning)
- POST /profile, GET /profile/{user_id}, PUT /profile
- POST /activity-result, POST /predict-learning-type
- GET /recommendations, POST /track-behavior, GET /statistics/{user_id}

Data model snippets
```typescript
interface ActivityResult {
   activityId: string;
   activityType: string;
   userId: string;
   startTime: Date;
   endTime: Date;
   completionTime: number;
   // + activity-specific metrics
}
```

Example scoring (illustrative pseudocode)
```python
def calculate_learning_scores(activity_results):
      scores = {"visual": 0, "auditory": 0, "kinesthetic": 0, "reading_writing": 0}
      for r in activity_results:
            if r.activity_type == "memory_challenge":
                  scores["visual"] += (r.recall_accuracy / 100) * 25
            elif r.activity_type == "problem_solving":
                  scores["kinesthetic"] += (r.interaction_count / 50) * 25
            elif r.activity_type == "audio_visual":
                  scores["auditory"] += r.audio_focus_ratio * 25
                  scores["visual"] += (1 - r.audio_focus_ratio) * 15
            elif r.activity_type == "reading_writing":
                  scores["reading_writing"] += (r.response_accuracy / 100) * 25
      return scores
```

---

## Database: Users table (Supabase)

Custom users table stored alongside Supabase Auth for extended profile data.

Columns (summary)
- user_id UUID PK (references auth.users.id)
- name TEXT, email TEXT (unique), role TEXT ('user' | 'admin' default 'user')
- created_at, updated_at TIMESTAMPTZ

Setup
1. Open Supabase SQL Editor
2. Execute SQL from `database/users_table.sql`
3. RLS is enabled; users only access their own rows

Benefits
- Clear separation of auth and profile data, extensible, referential integrity

---

## Getting started

Prerequisites
- Node.js 18+ (for Next.js frontend)
- Python 3.9+ (for FastAPI backend)
- Supabase project (URL + keys)

Environment variables
- Frontend (`frontend/.env.local`)
   - NEXT_PUBLIC_SUPABASE_URL=...
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=...
- Backend (`backend_new/.env`)
   - SUPABASE_URL=...
   - SUPABASE_ANON_KEY=... (or SERVICE_ROLE key when appropriate)
   - GROQ_API_KEY=... (optional)
   - YOUTUBE_API_KEY=..., UDEMY_CLIENT_ID/SECRET=... (optional)
   - HOST=0.0.0.0, PORT=8000, DEBUG=true

Run the frontend
```powershell
cd frontend
npm install
npm run dev
# App at http://localhost:3000
```

Run the backend (FastAPI)
```powershell
cd backend_new
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python .\main.py
# API at http://localhost:8000 (docs at /docs)
```

Optional: Docker
- This repo includes Dockerfile and docker-compose.yml at root. If you prefer containers, adapt these to your environment (configure Supabase env vars). Example compose targets the app services; review before use.

---

## Contributing

1) Fork and branch (feat/your-change)
2) Make changes with tests/docs when relevant
3) Lint/format (ESLint, Black/Flake8)
4) Open a pull request

## License

MIT License (see LICENSE if present)

## Acknowledgements

- Supabase for auth and Postgres
- FastAPI ecosystem (Pydantic, Uvicorn)
- Groq/Open-source LLM tooling, httpx/aiohttp

