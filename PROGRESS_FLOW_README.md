# PathMentor Progress Flow Documentation

## Overview
The progress questionnaire flow has been restructured to be completely database-driven, following the provided Supabase schema. The flow now consists of:

1. **Category Selection** - Dynamic categories from the database
2. **General Questions** - Generic questions from the database
3. **Category-Specific Questions** - Questions related to the selected category
4. **Completion** - Summary and next steps

## Database Schema Used

The implementation follows the provided database schema with these key tables:

- `categories` - Learning categories
- `general_questions` - All questions (both general and category-specific)
- `question_options` - Multiple choice options for questions
- `category_questions` - Links questions to specific categories
- `user_answers` - Stores user responses
- `user_category_selections` - Tracks user's selected category

## API Endpoints

### Categories
- `GET /api/categories` - Fetch all available categories
- `POST /api/categories` - Create a new category (admin)

### Questions
- `GET /api/questions?type=general` - Fetch general questions
- `GET /api/questions/category?categoryId=<id>` - Fetch category-specific questions

### Answers
- `POST /api/answers` - Save user answers
- `GET /api/answers?userId=<id>` - Fetch user's answers

### User Category Selection
- `POST /api/user-category-selection` - Save user's category choice
- `GET /api/user-category-selection?userId=<id>` - Get user's selected category

## File Structure

```
src/app/
├── api/
│   ├── categories/
│   │   └── route.ts
│   ├── questions/
│   │   ├── route.ts
│   │   └── category/
│   │       └── route.ts
│   ├── answers/
│   │   └── route.ts
│   └── user-category-selection/
│       └── route.ts
└── user/(authenticated)/progress/questions/
    ├── page.tsx                  # Category selection
    ├── general/
    │   └── page.tsx             # General questions
    ├── category/
    │   └── page.tsx             # Category-specific questions
    └── complete/
        └── page.tsx             # Completion page
```

## State Management

The `useQuestionnaireStore` (Zustand) manages:
- Selected category and category ID
- Current questionnaire step
- Questions fetched from database
- User answers
- Navigation state

## Flow Description

1. **Category Selection (`/user/progress/questions`)**
   - Fetches categories from `/api/categories`
   - User selects a category
   - Saves selection via `/api/user-category-selection`
   - Navigates to general questions

2. **General Questions (`/user/progress/questions/general`)**
   - Fetches general questions from `/api/questions?type=general`
   - User answers questions
   - Saves answers via `/api/answers`
   - Navigates to category-specific questions

3. **Category Questions (`/user/progress/questions/category`)**
   - Fetches category-specific questions from `/api/questions/category?categoryId=<id>`
   - User answers category-specific questions
   - Saves answers via `/api/answers`
   - Navigates to completion page

4. **Completion (`/user/progress/questions/complete`)**
   - Shows completion confirmation
   - Provides navigation to dashboard or questionnaire retake

## Key Features

- **Database-driven**: All questions and categories come from Supabase
- **Dynamic**: Easy to add new categories and questions without code changes
- **Flexible**: Supports both multiple choice and text input questions
- **Persistent**: Answers are saved to the database in real-time
- **Resumable**: State is persisted in localStorage via Zustand

## TODO Items

1. Integrate with actual authentication context to get real user IDs
2. Add form validation and error handling
3. Implement question dependencies/conditional logic
4. Add progress indicators
5. Implement learning path generation based on answers
6. Add admin interface for managing questions and categories

## Removed Files

The following hardcoded question files have been removed:
- `/programming/` folder and all contents
- `/graphicDesign/` folder and all contents  
- `/videoEditing/` folder and all contents
- `/loading/` folder and all contents
- Duplicate `/pathmentor/` folder

The system now relies entirely on database-driven content.
