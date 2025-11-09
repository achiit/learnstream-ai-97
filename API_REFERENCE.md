# API Reference - Database & Auth Functions

## Authentication Hooks

### `useAuth()`

Main authentication hook for managing user sessions.

```typescript
import { useAuth } from '@/hooks/useAuth';

const {
  user,             // Current user object or null
  session,          // Current session object or null
  loading,          // Boolean: auth state loading
  signIn,           // Function: sign in user
  signUp,           // Function: sign up new user
  signOut,          // Function: sign out user
  resetPassword,    // Function: send password reset email
  signInWithGoogle  // Function: sign in with Google OAuth
} = useAuth();
```

#### Methods

**`signIn(email: string, password: string)`**
```typescript
const { error } = await signIn('user@example.com', 'password123');
if (!error) {
  // User signed in successfully
}
```

**`signUp(email: string, password: string)`**
```typescript
const { error } = await signUp('user@example.com', 'password123');
if (!error) {
  // Account created, check email for confirmation
}
```

**`signOut()`**
```typescript
const { error } = await signOut();
if (!error) {
  // User signed out, redirected to home
}
```

**`resetPassword(email: string)`**
```typescript
const { error } = await resetPassword('user@example.com');
if (!error) {
  // Password reset email sent
}
```

**`signInWithGoogle()`**
```typescript
const { error } = await signInWithGoogle();
// Note: This will redirect to Google OAuth
// User will be redirected back after authentication
```

---

### `useUser()`

User profile management hook.

```typescript
import { useUser } from '@/hooks/useUser';

const {
  user,           // Current user object
  profile,        // User profile from database
  loading,        // Boolean: profile loading
  updateProfile,  // Function: update profile
  refreshProfile  // Function: refresh profile data
} = useUser();
```

#### Profile Object
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

#### Methods

**`updateProfile(updates: Partial<UserProfile>)`**
```typescript
const { error } = await updateProfile({
  full_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg'
});
```

**`refreshProfile()`**
```typescript
await refreshProfile(); // Refetch profile from database
```

---

## Data Management Hooks

### `useLearningSession()`

Manage learning sessions (uploads and prompts).

```typescript
import { useLearningSession } from '@/hooks/useLearningSession';

const {
  sessions,           // Array of user's sessions
  loading,            // Boolean: sessions loading
  createSession,      // Function: create new session
  updateSessionStatus,// Function: update session status
  deleteSession,      // Function: delete session
  refreshSessions     // Function: refresh sessions list
} = useLearningSession();
```

#### Session Object
```typescript
interface LearningSession {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  source_type: 'upload' | 'prompt';
  source_content?: string;
  file_url?: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}
```

#### Methods

**`createSession(title, sourceType, sourceContent?, fileUrl?, description?)`**
```typescript
// From prompt
const session = await createSession(
  'Learn Photosynthesis',
  'prompt',
  'Explain how photosynthesis works in plants...',
  undefined,
  'Biology topic'
);

// From upload
const session = await createSession(
  'Chapter 5 - Biology',
  'upload',
  undefined,
  'https://storage.url/textbook.pdf',
  'Textbook chapter 5'
);
```

**`updateSessionStatus(sessionId: string, status: string)`**
```typescript
await updateSessionStatus(sessionId, 'completed');
```

**`deleteSession(sessionId: string)`**
```typescript
await deleteSession(sessionId);
```

---

### `useVideo()`

Manage videos and watch progress.

```typescript
import { useVideo } from '@/hooks/useVideo';

const {
  videos,           // Array of user's videos
  loading,          // Boolean: videos loading
  createVideo,      // Function: create video record
  getSessionVideos, // Function: get videos for session
  updateProgress,   // Function: update watch progress
  getProgress,      // Function: get watch progress
  refreshVideos     // Function: refresh videos list
} = useVideo();
```

#### Video Object
```typescript
interface GeneratedVideo {
  id: string;
  session_id: string;
  user_id: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  transcript?: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
}
```

#### Progress Object
```typescript
interface LearningProgress {
  id: string;
  user_id: string;
  video_id: string;
  progress_percentage: number;
  last_position: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Methods

**`createVideo(sessionId, videoUrl, thumbnailUrl?, duration?, transcript?)`**
```typescript
const video = await createVideo(
  sessionId,
  'https://cdn.example.com/video.mp4',
  'https://cdn.example.com/thumb.jpg',
  600, // duration in seconds
  'Video transcript here...'
);
```

**`getSessionVideos(sessionId: string)`**
```typescript
const videos = await getSessionVideos(sessionId);
```

**`updateProgress(videoId, progressPercentage, lastPosition, completed?)`**
```typescript
// Update progress to 50%, at 2 minutes (120 seconds)
await updateProgress(videoId, 50, 120, false);

// Mark as completed
await updateProgress(videoId, 100, 600, true);
```

**`getProgress(videoId: string)`**
```typescript
const progress = await getProgress(videoId);
console.log(`Watched ${progress.progress_percentage}%`);
```

---

## Direct Database Operations

### `db.profiles`

Profile operations.

```typescript
import { db } from '@/lib/database';

// Get profile
const profile = await db.profiles.getProfile(userId);

// Update profile
const updated = await db.profiles.updateProfile(userId, {
  full_name: 'Jane Smith',
  avatar_url: 'https://...'
});
```

---

### `db.sessions`

Learning session operations.

```typescript
import { db } from '@/lib/database';

// Create session
const session = await db.sessions.createSession({
  user_id: userId,
  title: 'Chemistry Lesson',
  source_type: 'prompt',
  source_content: 'Explain ionic bonds...',
});

// Get single session
const session = await db.sessions.getSession(sessionId);

// Get all user sessions
const sessions = await db.sessions.getUserSessions(userId);

// Update session
const updated = await db.sessions.updateSession(sessionId, {
  status: 'completed',
  description: 'Updated description'
});

// Delete session
await db.sessions.deleteSession(sessionId);
```

---

### `db.videos`

Video operations.

```typescript
import { db } from '@/lib/database';

// Create video
const video = await db.videos.createVideo({
  session_id: sessionId,
  user_id: userId,
  video_url: 'https://...',
  thumbnail_url: 'https://...',
  duration: 300,
  transcript: 'Video content...',
});

// Get single video
const video = await db.videos.getVideo(videoId);

// Get session videos
const videos = await db.videos.getSessionVideos(sessionId);

// Get all user videos
const videos = await db.videos.getUserVideos(userId);

// Update video
const updated = await db.videos.updateVideo(videoId, {
  transcript: 'Updated transcript...',
  metadata: { tags: ['biology', 'cells'] }
});

// Delete video
await db.videos.deleteVideo(videoId);
```

---

### `db.progress`

Learning progress operations.

```typescript
import { db } from '@/lib/database';

// Get progress for specific video
const progress = await db.progress.getProgress(userId, videoId);

// Update or create progress (upsert)
const updated = await db.progress.updateProgress({
  user_id: userId,
  video_id: videoId,
  progress_percentage: 75,
  last_position: 450,
  completed: false
});

// Get all user progress
const allProgress = await db.progress.getUserProgress(userId);

// Get completed videos with video details
const completed = await db.progress.getCompletedVideos(userId);
```

---

### `db.storage`

File storage operations.

```typescript
import { db } from '@/lib/database';

// Upload file
const { path } = await db.storage.uploadFile(
  'textbooks',                    // bucket name
  `${userId}/chapter1.pdf`,       // file path
  file                            // File object
);

// Get public URL
const url = await db.storage.getPublicUrl('textbooks', path);

// Delete file
await db.storage.deleteFile('textbooks', path);

// List files in folder
const files = await db.storage.listFiles('textbooks', userId);
```

---

## Protected Routes

### `<ProtectedRoute>`

Wraps routes that require authentication.

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

**Behavior:**
- Shows loading spinner while checking auth
- Redirects to `/auth` if not authenticated
- Renders children if authenticated

---

## Supabase Client

Direct access to Supabase client for custom queries.

```typescript
import { supabase } from '@/integrations/supabase/client';

// Custom query
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Real-time subscription
const subscription = supabase
  .channel('any_channel_name')
  .on(
    'postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'learning_sessions',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Change detected:', payload);
    }
  )
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

---

## Type Definitions

All database types are available from:

```typescript
import type { 
  Database,
  Tables,
  TablesInsert,
  TablesUpdate 
} from '@/integrations/supabase/types';

// Use table types
type Profile = Tables<'profiles'>;
type Session = Tables<'learning_sessions'>;
type Video = Tables<'generated_videos'>;
type Progress = Tables<'learning_progress'>;

// Use insert types
type NewSession = TablesInsert<'learning_sessions'>;

// Use update types
type SessionUpdate = TablesUpdate<'learning_sessions'>;
```

---

## Error Handling

All operations return errors in a consistent format:

```typescript
const { data, error } = await someOperation();

if (error) {
  console.error('Operation failed:', error.message);
  toast.error(error.message);
  return;
}

// Use data
console.log('Success:', data);
```

Hooks automatically handle errors with toast notifications.

---

## Best Practices

### 1. Use Hooks for UI Components
```typescript
// ✅ Good: Use hooks in React components
function MyComponent() {
  const { sessions } = useLearningSession();
  return <div>{sessions.map(...)}</div>;
}
```

### 2. Use Direct DB Access for Utils
```typescript
// ✅ Good: Use db directly in utility functions
async function exportUserData(userId: string) {
  const sessions = await db.sessions.getUserSessions(userId);
  const videos = await db.videos.getUserVideos(userId);
  return { sessions, videos };
}
```

### 3. Handle Loading States
```typescript
function MyComponent() {
  const { sessions, loading } = useLearningSession();
  
  if (loading) return <Spinner />;
  
  return <div>{sessions.map(...)}</div>;
}
```

### 4. Error Boundaries
```typescript
try {
  await db.sessions.createSession({ ... });
} catch (error) {
  console.error('Failed:', error);
  toast.error('Something went wrong');
}
```

### 5. Type Safety
```typescript
// ✅ Good: Use proper types
import type { Tables } from '@/integrations/supabase/types';

function processSession(session: Tables<'learning_sessions'>) {
  // TypeScript knows the shape of session
  console.log(session.title);
}
```

---

## Environment Variables

Required in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Access in code:
```typescript
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

---

For setup instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
For quick start, see [QUICK_START.md](./QUICK_START.md)

