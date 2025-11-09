# Database Setup Guide

If you're getting "Failed to create learning session" errors, it means your Supabase database tables haven't been created yet.

## Quick Setup Steps

### 1. Go to Supabase SQL Editor

1. Visit [supabase.com](https://supabase.com)
2. Open your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### 2. Run the Migration

Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` into the SQL editor and click "Run".

This will create:
- `profiles` table
- `learning_sessions` table
- `generated_videos` table  
- `learning_progress` table
- All necessary triggers and Row Level Security (RLS) policies

### 3. Verify Tables Were Created

1. Click on "Table Editor" in the left sidebar
2. You should see the following tables:
   - profiles
   - learning_sessions
   - generated_videos
   - learning_progress

### 4. Test the Application

1. Sign out and sign back in to your application
2. Try creating a learning session from the Dashboard
3. It should work now!

## Common Errors

### "Database table not found"
- **Error Code**: 42P01
- **Solution**: Run the migration SQL (step 2 above)

### "User profile not found"  
- **Error Code**: 23503
- **Solution**: Sign out and sign back in. The profile should be auto-created on login.

### "relation does not exist"
- **Solution**: The table hasn't been created. Run the migration.

## Check Your .env File

Make sure you have the correct Supabase credentials in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

## Need Help?

Check the browser console (F12) for detailed error messages. The application now logs:
- Error codes
- Error messages
- Hints for fixing the issue

