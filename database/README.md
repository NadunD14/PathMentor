# Database Setup

## Users Table

This project uses a custom `users` table to store additional user information alongside Supabase's built-in authentication.

### Table Structure

- `user_id` (UUID, Primary Key): References `auth.users(id)` from Supabase Auth
- `name` (TEXT): User's full name
- `email` (TEXT, Unique): User's email address
- `role` (TEXT): User role ('user' or 'admin'), defaults to 'user'
- `created_at` (TIMESTAMPTZ): Auto-generated creation timestamp
- `updated_at` (TIMESTAMPTZ): Auto-updated modification timestamp

### Setup Instructions

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Run the SQL script from `users_table.sql` to create the table and its associated policies

### How It Works

1. **Registration Flow**:
   - User fills out registration form
   - `signUp()` function creates user in Supabase Auth
   - Same function then inserts user data into custom `users` table
   - Both operations use the same UUID for consistency

2. **OAuth Flow**:
   - User signs in with Google/GitHub
   - `handleOAuthUserCreation()` checks if user exists in `users` table
   - If not, creates a new record with data from OAuth provider

3. **Data Retrieval**:
   - `getCurrentUser()` fetches user data from both Auth and `users` table
   - `getUserProfile()` specifically fetches from `users` table

### Security

- Row Level Security (RLS) is enabled
- Users can only read/update their own data
- Automatic cleanup when auth user is deleted (CASCADE)

### Benefits

- Separation of concerns (auth vs. user data)
- Easy to extend with additional user fields
- Maintains referential integrity
- Secure with proper RLS policies
