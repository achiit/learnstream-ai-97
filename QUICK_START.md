# Quick Start Guide - Supabase Auth & Database

## What's Been Added

Your LearnStream AI application now has a complete authentication and database system powered by Supabase! 🎉

## 📁 New Files Created

### Authentication & Hooks
- `src/hooks/useAuth.tsx` - Authentication hook for sign in/up/out
- `src/hooks/useUser.tsx` - User profile management hook
- `src/hooks/useLearningSession.tsx` - Learning sessions management
- `src/hooks/useVideo.tsx` - Video and progress tracking
- `src/components/ProtectedRoute.tsx` - Route protection component

### Database
- `src/lib/database.ts` - Database query helper functions
- `src/integrations/supabase/types.ts` - Updated with database types
- `supabase/migrations/001_initial_schema.sql` - Database schema

### Configuration
- `env.example` - Environment variables template
- `SUPABASE_SETUP.md` - Detailed setup instructions
- `.gitignore` - Updated to exclude .env files

## 🚀 Getting Started

### 1. Set Up Supabase (5 minutes)

1. **Create a Supabase project**:
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in project details and wait for creation

2. **Get your credentials**:
   - Go to Settings → API
   - Copy your **Project URL** and **anon public key**

3. **Configure environment variables**:
   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
   ```

4. **Run the database migration**:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run it

### 2. Test Your Setup (2 minutes)

```bash
# Install dependencies (if needed)
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` and:
1. Click "Get Started" or navigate to `/auth`
2. Create a new account
3. Check your email for confirmation
4. Sign in and access the dashboard
5. Try creating a learning session!

## 📊 Database Schema

Your application now has these tables:

### `profiles`
- Stores user profile information
- Automatically created when users sign up
- Fields: id, email, full_name, avatar_url

### `learning_sessions`
- Tracks user uploads and prompts
- Fields: title, description, source_type, status

### `generated_videos`
- Stores AI-generated video content
- Fields: video_url, thumbnail_url, duration, transcript

### `learning_progress`
- Tracks user progress on videos
- Fields: progress_percentage, last_position, completed

## 🎯 How to Use

### Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, signIn, signUp, signOut, signInWithGoogle } = useAuth();
  
  // Sign in with email
  await signIn('email@example.com', 'password');
  
  // Sign in with Google (one-click)
  await signInWithGoogle();
  
  // Sign up
  await signUp('email@example.com', 'password');
  
  // Sign out
  await signOut();
}
```

### User Profile

```typescript
import { useUser } from '@/hooks/useUser';

function Profile() {
  const { user, profile, updateProfile } = useUser();
  
  // Update profile
  await updateProfile({ 
    full_name: 'John Doe',
    avatar_url: 'https://...'
  });
}
```

### Learning Sessions

```typescript
import { useLearningSession } from '@/hooks/useLearningSession';

function Dashboard() {
  const { sessions, createSession, deleteSession } = useLearningSession();
  
  // Create a session from prompt
  await createSession(
    'Photosynthesis',
    'prompt',
    'Explain photosynthesis...'
  );
  
  // Create a session from upload
  await createSession(
    'Chapter 5',
    'upload',
    undefined,
    'https://storage.url/file.pdf'
  );
  
  // Delete a session
  await deleteSession(sessionId);
}
```

### Videos & Progress

```typescript
import { useVideo } from '@/hooks/useVideo';

function VideoPlayer() {
  const { videos, updateProgress, getProgress } = useVideo();
  
  // Update watch progress
  await updateProgress(videoId, 50, 120); // 50%, 120 seconds
  
  // Get current progress
  const progress = await getProgress(videoId);
}
```

### Direct Database Access

```typescript
import { db } from '@/lib/database';

// Profile operations
const profile = await db.profiles.getProfile(userId);
await db.profiles.updateProfile(userId, { full_name: 'New Name' });

// Session operations
const sessions = await db.sessions.getUserSessions(userId);
const session = await db.sessions.createSession({ ... });

// Video operations
const videos = await db.videos.getUserVideos(userId);
const video = await db.videos.createVideo({ ... });

// Progress operations
await db.progress.updateProgress({ ... });
const progress = await db.progress.getUserProgress(userId);
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Protected Routes**: Authentication required for dashboard, level-check, and generate pages
- **Automatic Profile Creation**: Profiles created automatically on signup
- **Session Management**: Automatic session refresh and state management

## 🎨 Updated Dashboard

The Dashboard now:
- ✅ Shows personalized welcome message with user's name
- ✅ Displays learning history from database
- ✅ Creates database records when uploading or prompting
- ✅ Shows session status (processing, completed, failed)
- ✅ Allows deleting sessions
- ✅ Has loading states and error handling

## 📝 Next Steps

1. **Email Configuration** (Optional):
   - Set up custom SMTP in Supabase → Authentication → Settings
   - For development, use Supabase's default email service

2. **Storage Setup** (Optional):
   - Create storage buckets in Supabase → Storage
   - Buckets: `textbooks`, `thumbnails`, `user-uploads`
   - Use `db.storage.uploadFile()` to upload files

3. **Connect to AI Backend**:
   - Replace TODOs in Dashboard.tsx
   - Process uploaded files and prompts with your AI service
   - Store generated videos in the database

4. **Enhance Features**:
   - Add profile editing page
   - Implement video player with progress tracking
   - Add search and filtering for sessions
   - Implement real-time updates with Supabase subscriptions

## 🐛 Troubleshooting

### "Invalid API key" error
- Check your `.env` file has correct values
- Ensure variable names start with `VITE_`
- Restart dev server after changing `.env`

### Can't sign up
- Check if you confirmed your email
- Look in spam folder for confirmation email
- For development, disable email confirmation in Supabase

### No data showing
- Verify database migration ran successfully
- Check browser console for errors
- Ensure RLS policies are active

## 📚 Resources

- [Full Setup Guide](./SUPABASE_SETUP.md) - Detailed instructions
- [Supabase Docs](https://supabase.com/docs) - Official documentation
- [React Query Docs](https://tanstack.com/query) - For data fetching
- [Shadcn/ui](https://ui.shadcn.com/) - UI components

## ✨ Features Summary

✅ **Authentication**
- Email/password sign up and sign in
- **Google OAuth sign in** (one-click login)
- Email confirmation
- Password reset
- Session management
- Auto-redirect for protected routes

✅ **Database**
- User profiles
- Learning sessions
- Generated videos
- Progress tracking
- Row Level Security

✅ **Developer Experience**
- Type-safe database queries
- Custom hooks for common operations
- Error handling and loading states
- Toast notifications
- Protected routes

---

**Ready to start building?** Just set up your Supabase credentials in `.env` and run `npm run dev`!

For detailed instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

