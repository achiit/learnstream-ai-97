# Prompt Storage Setup Guide

All your prompts and interactions are now being stored in the Supabase database! 🎉

## What's Being Stored

### 1. Video Generation Prompts ✅
- **Already working!** 
- Stored in: `learning_sessions` table
- Fields stored:
  - `title`: Truncated prompt (first 50 characters)
  - `source_content`: Full prompt text
  - `source_type`: 'prompt'
  - `description`: 'Custom learning topic'
  - User ID, status, timestamps

### 2. Live Chat Interactions 🆕
- **New feature added!**
- Stored in: `chat_messages` table  
- Fields stored:
  - `message`: The chat message text
  - `role`: 'user' or 'ai'
  - `user_id`: Your user ID
  - `session_id`: Optional link to learning session
  - `created_at`: Timestamp

## Setup Instructions

### Step 1: Run Database Migration

You need to create the new `chat_messages` table in your Supabase database:

1. Go to [Supabase Dashboard](https://supabase.com)
2. Open your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy and paste the migration from either:
   - `supabase/migrations/002_chat_messages.sql` (just the new table)
   - OR re-run the complete `supabase/migrations/001_initial_schema.sql` (includes everything)
6. Click **"Run"**

### Step 2: Verify Table Creation

1. Click **"Table Editor"** in the left sidebar
2. You should now see a new table: `chat_messages`
3. The table should have these columns:
   - id (UUID)
   - user_id (UUID)
   - session_id (UUID, nullable)
   - role (text)
   - message (text)
   - created_at (timestamp)

### Step 3: Test the Feature

1. Go to your Dashboard
2. Try the **"Generate Video"** tab:
   - Enter a prompt
   - Click "Generate Video"
   - Check `learning_sessions` table in Supabase - you'll see the prompt stored
3. Try the **"Live Interaction"** tab:
   - Send a message
   - Check `chat_messages` table in Supabase - you'll see both user and AI messages

## How It Works

### Video Generation Prompts
```typescript
// When you submit a prompt from "Generate Video" tab:
createSession(
  title: "First 50 chars of prompt...",
  sourceType: 'prompt',
  sourceContent: "Full prompt text here",
  description: 'Custom learning topic'
)
// → Saved to learning_sessions table
```

### Chat Interactions
```typescript
// When you send a chat message from "Live Interaction" tab:
db.chat.createMessage({
  user_id: user.id,
  role: 'user', // or 'ai'
  message: "Your message text",
})
// → Saved to chat_messages table
```

## Viewing Your Data

### In Supabase Dashboard:
1. Go to **"Table Editor"**
2. Select **"learning_sessions"** to see video prompts
3. Select **"chat_messages"** to see chat history

### In Your App (Future Enhancement):
You can retrieve stored data using:
```typescript
// Get user's chat history
const messages = await db.chat.getUserMessages(userId);

// Get user's learning sessions
const sessions = await db.sessions.getUserSessions(userId);
```

## Database Operations Available

### Chat Messages:
- `db.chat.createMessage(message)` - Save a new message
- `db.chat.getUserMessages(userId)` - Get all user messages
- `db.chat.getSessionMessages(sessionId)` - Get messages for a session
- `db.chat.deleteMessage(messageId)` - Delete a message
- `db.chat.deleteUserMessages(userId)` - Delete all user messages

### Learning Sessions:
- `db.sessions.createSession(session)` - Create new session
- `db.sessions.getUserSessions(userId)` - Get all user sessions
- `db.sessions.updateSession(id, updates)` - Update session
- `db.sessions.deleteSession(id)` - Delete session

## Security Features

- ✅ **Row Level Security (RLS)** enabled
- ✅ Users can only see/create/delete their own data
- ✅ All queries are authenticated
- ✅ Foreign key constraints ensure data integrity

## Troubleshooting

### "Error saving message to database"
- Check browser console for detailed error
- Ensure you've run the database migration
- Verify you're logged in

### "Table does not exist"
- Run the SQL migration (Step 1 above)
- Check that the table appears in Supabase Table Editor

### Messages not appearing in database
- Open browser console (F12)
- Look for "User message saved to database" logs
- If you see errors, check Supabase project settings

## Next Steps

Consider adding:
1. **Chat History Persistence**: Load previous chat messages when reopening the app
2. **Search**: Search through stored prompts and messages
3. **Export**: Download your chat history
4. **Analytics**: Track most common prompts/topics

---

Need help? Check the browser console for detailed logs!

