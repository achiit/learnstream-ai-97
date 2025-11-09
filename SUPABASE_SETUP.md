# Supabase Setup Guide

This guide will help you set up Supabase authentication and database for your LearnStream AI application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - **Name**: learnstream-ai (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
4. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on the "Settings" icon (gear icon)
2. Click on "API" in the left sidebar
3. You'll need two values:
   - **Project URL**: Copy the URL under "Project URL"
   - **anon public**: Copy the key under "Project API keys" -> "anon public"

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project:
   ```bash
   touch .env
   ```

2. Add your Supabase credentials to the `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

3. Replace the placeholder values with your actual credentials from Step 2

**Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

## Step 4: Run Database Migrations

You have two options to set up your database schema:

### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (You can find your project ref in the Supabase dashboard URL)

3. Push the migrations:
   ```bash
   supabase db push
   ```

### Option B: Using SQL Editor (Manual)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute the migration

## Step 5: Verify Database Setup

After running the migration, you should have the following tables in your database:

- **profiles**: User profiles linked to authentication
- **learning_sessions**: User learning sessions (uploads/prompts)
- **generated_videos**: Videos generated from learning sessions
- **learning_progress**: Track user progress on videos

To verify:
1. Go to "Table Editor" in your Supabase dashboard
2. You should see all four tables listed

## Step 6: Configure Authentication

1. In your Supabase dashboard, go to "Authentication" -> "Providers"
2. Make sure "Email" is enabled (it should be by default)
3. Configure your email templates:
   - Go to "Authentication" -> "Email Templates"
   - Customize the templates if desired

### Email Settings (Optional)

For production, you'll want to set up a custom SMTP provider:
1. Go to "Settings" -> "Authentication"
2. Scroll down to "SMTP Settings"
3. Add your SMTP credentials

For development, you can use Supabase's built-in email service.

## Step 7: Set Up Storage (Optional)

If you plan to upload files (textbooks, images):

1. Go to "Storage" in your Supabase dashboard
2. Click "Create bucket"
3. Create buckets for:
   - `textbooks`: For uploaded textbook files
   - `thumbnails`: For video thumbnails
   - `user-uploads`: For general user uploads

4. Set bucket policies:
   - Click on a bucket
   - Go to "Policies"
   - Add policies to allow authenticated users to upload/read files

Example policy for authenticated uploads:
```sql
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'textbooks');

CREATE POLICY "Authenticated users can view files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'textbooks');
```

## Step 8: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/auth` in your browser
3. Try creating an account
4. Check your email for the confirmation link
5. Confirm your email and sign in
6. You should be redirected to the dashboard

## Database Operations

The application includes helper functions in `src/lib/database.ts` for common operations:

### Profile Operations
```typescript
import { db } from '@/lib/database';

// Get user profile
const profile = await db.profiles.getProfile(userId);

// Update profile
await db.profiles.updateProfile(userId, { full_name: 'John Doe' });
```

### Learning Session Operations
```typescript
// Create a session
const session = await db.sessions.createSession({
  user_id: userId,
  title: 'Photosynthesis',
  source_type: 'prompt',
  source_content: 'Explain photosynthesis...',
});

// Get user sessions
const sessions = await db.sessions.getUserSessions(userId);
```

### Video Operations
```typescript
// Create a video
const video = await db.videos.createVideo({
  session_id: sessionId,
  user_id: userId,
  video_url: 'https://...',
});

// Get user videos
const videos = await db.videos.getUserVideos(userId);
```

### Progress Tracking
```typescript
// Update progress
await db.progress.updateProgress({
  user_id: userId,
  video_id: videoId,
  progress_percentage: 50,
  last_position: 120,
});

// Get user progress
const progress = await db.progress.getUserProgress(userId);
```

## Authentication Hooks

Use the provided hooks for authentication:

### useAuth Hook
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  
  // Use the auth methods
  const handleSignIn = async () => {
    await signIn(email, password);
  };
}
```

### useUser Hook
```typescript
import { useUser } from '@/hooks/useUser';

function Profile() {
  const { user, profile, updateProfile } = useUser();
  
  // Update user profile
  const handleUpdate = async () => {
    await updateProfile({ full_name: 'New Name' });
  };
}
```

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env` file has the correct API key
- Make sure the variable names start with `VITE_`
- Restart your dev server after changing `.env`

### Email confirmation not working
- Check your spam folder
- In development, you can disable email confirmation:
  - Go to Authentication -> Settings
  - Disable "Enable email confirmations"

### Database connection errors
- Verify your Supabase project is running
- Check your project URL is correct
- Ensure migrations have been run successfully

### Row Level Security (RLS) errors
- RLS policies are already set up in the migration
- Users can only access their own data
- If you need to modify policies, go to Authentication -> Policies

## Next Steps

1. Customize the database schema for your needs
2. Add more authentication providers (Google, GitHub, etc.)
3. Implement file upload functionality
4. Add real-time subscriptions for collaborative features
5. Set up database backups in production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter any issues:
1. Check the Supabase Dashboard logs
2. Review the browser console for errors
3. Check the Network tab for failed API requests
4. Consult the Supabase documentation

