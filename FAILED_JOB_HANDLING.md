# Failed Job Handling - Reference Guide

## ✅ What's Been Implemented

The video queue now properly displays and handles failed video generation jobs with clear visual feedback and recovery options.

## 🎨 Visual Improvements

### Failed Job Display

When a job fails (e.g., "Max retries exceeded"), the queue shows:

```
┌─────────────────────────────────────────────┐
│ 🔴 explain the sine curve                  │
│ Nov 9, 6:15 AM                             │
│ [Failed Badge]                             │
│                                            │
│ ╔═══════════════════════════════════════╗ │
│ ║ ⚠️ Generation Failed                   ║ │
│ ║ Max retries exceeded.                  ║ │
│ ╚═══════════════════════════════════════╝ │
│                                            │
│ [🔄 Retry] [🗑️ Delete]                    │
└─────────────────────────────────────────────┘
```

### Queue Header

Shows failed count in red:
```
Video Generation Queue
2 active • 5 completed • 1 failed
```

### Status Badges

- **Queued**: Secondary badge "Queued" with blue spinner
- **Processing**: Primary badge "Processing" with spinner
- **Ready**: Success badge "Ready" with green checkmark
- **Failed**: Destructive badge "Failed" with red X

## 📋 Features

### 1. Error Message Display
```typescript
// Cleans up rich text formatting from API
"[bold red]Max retries exceeded.[/bold red]"
    ↓
"Max retries exceeded."
```

- Displayed in red box with warning icon
- Formatted cleanly (removes markup)
- Easy to read and understand

### 2. Toast Notifications

When a job fails, user sees:
```
❌ Video Generation Failed
explain the sine curve: Max retries exceeded.
Duration: 5 seconds
```

### 3. Retry Functionality

Failed jobs show a **"Retry"** button that:
1. Removes the failed job from queue
2. Creates a new video generation request
3. Uses the same prompt
4. Adds new job with fresh job_id
5. Shows toast: "New video generation started!"

### 4. Visual Indicators

**Status Icons:**
- 🔵 Queued: Spinning blue loader
- 🟣 Processing: Spinning primary loader  
- ✅ Ready: Green checkmark
- ❌ Failed: Red X circle

**Color Coding:**
- Failed jobs have red error boxes
- Failed badge is red/destructive
- Failed count in header is red

## 🔧 Technical Implementation

### Queue Polling

The `useVideoQueue` hook automatically:
- Polls every 5 seconds for active jobs
- Detects status changes
- Shows toast when job fails
- Cleans error messages from API

```typescript
// Handles failed status
if (status.status === 'failed' && job.status !== 'failed') {
  const cleanError = status.error 
    ? status.error.replace(/\[bold red\]/g, '').replace(/\[\/bold red\]/g, '').trim()
    : 'An unknown error occurred';
  
  toast.error('Video Generation Failed', {
    description: `${job.userPrompt}: ${cleanError}`,
    duration: 5000,
  });
}
```

### Error Message Cleaning

Removes Manim's rich text formatting:
```typescript
job.error.replace(/\[bold red\]/g, '').replace(/\[\/bold red\]/g, '')
```

### Retry Logic

```typescript
const handleRetryJob = async (job: QueuedJob) => {
  // Remove failed job
  removeJob(job.job_id);
  
  // Start new generation
  const response = await manimService.generateVideo({
    prompt: job.prompt,
    enable_audio: false,
    review_cycles: 3,
  });
  
  // Add to queue
  addJob(response, job.userPrompt);
};
```

## 📊 Example Scenarios

### Scenario 1: Max Retries Exceeded

**API Response:**
```json
{
  "job_id": "0813095d-6983-4802-9744-30dc11ff21ee",
  "status": "failed",
  "progress": "Review cycle 1/4",
  "error": "[bold red]Max retries exceeded.[/bold red]",
  "created_at": "2025-11-09T06:15:35.025210",
  "prompt": "Explain the sine curve..."
}
```

**User Sees:**
- Red X icon
- "Failed" badge in red
- Error box: "Generation Failed - Max retries exceeded."
- Retry button available
- Can delete or retry

### Scenario 2: Server Error

**API Response:**
```json
{
  "job_id": "abc-123",
  "status": "failed",
  "error": "Internal server error",
  "progress": "Generating code"
}
```

**User Sees:**
- Clear error message
- Option to retry
- Error in toast notification

### Scenario 3: Timeout

**API Response:**
```json
{
  "job_id": "xyz-789",
  "status": "failed",
  "error": "Generation timeout after 5 minutes"
}
```

**User Sees:**
- Timeout message in red box
- Retry button (will attempt again)
- Can delete if don't want to retry

## 🎯 User Actions

### For Failed Jobs:

1. **View Error**: See what went wrong
2. **Retry**: Attempt generation again
3. **Delete**: Remove from queue
4. **Clear All Failed**: Bulk remove completed/failed jobs

### Queue Management:

- Expand/collapse queue panel
- Clear all completed and failed jobs at once
- Failed jobs don't auto-remove (user decides)

## 💡 Best Practices

### For Users:

1. **Check Error Message**: Understand what went wrong
2. **Wait Before Retry**: Give server a moment to recover
3. **Try Simpler Prompt**: If keeps failing, simplify
4. **Report Persistent Failures**: If retries don't work

### For Developers:

1. **Always show errors clearly**: No technical jargon
2. **Provide retry option**: Let users try again
3. **Clean error messages**: Remove formatting codes
4. **Log failures**: Track common errors
5. **Show progress**: Even for failed jobs

## 🐛 Common Errors

### "Max retries exceeded"
**Cause**: Manim generation attempts exceeded limit  
**Solution**: Retry with simpler prompt or fewer review cycles

### "Internal server error"
**Cause**: Backend service issue  
**Solution**: Wait a moment, then retry

### "Generation timeout"
**Cause**: Video took too long to generate  
**Solution**: Try simpler animations or reduce complexity

### "Invalid prompt"
**Cause**: Prompt format not recognized  
**Solution**: Rephrase prompt more clearly

## 📈 Status Flow

```
Queued (🔵)
    ↓
Processing (🟣)
    ↓
  ╔═══╩═══╗
  ↓       ↓
Ready ✅  Failed ❌
  ↓       ↓
View    Retry
Download  ↓
Delete  New Job
```

## 🎨 UI Components

### VideoJobQueue Component

Props:
- `queue`: Array of jobs
- `onRemoveJob`: Remove from queue
- `onClearCompleted`: Clear finished/failed
- `onViewVideo`: View completed video
- `onRetryJob`: Retry failed job ✨ NEW

### Failed Job Card

Structure:
```tsx
<Card>
  <Icon status="failed" /> {/* Red X */}
  <Title>{job.userPrompt}</Title>
  <Badge variant="destructive">Failed</Badge>
  
  <ErrorBox>
    <Title>Generation Failed</Title>
    <Message>{cleanError}</Message>
  </ErrorBox>
  
  <Actions>
    <RetryButton />
    <DeleteButton />
  </Actions>
</Card>
```

## ✅ Testing Checklist

- [ ] Failed job shows red X icon
- [ ] Error message is displayed clearly
- [ ] Rich text formatting is removed
- [ ] Toast notification appears
- [ ] Retry button is visible
- [ ] Retry creates new job
- [ ] Failed count shows in header
- [ ] Can delete failed jobs
- [ ] Clear completed removes failed jobs
- [ ] Status badge shows "Failed" in red

## 🎉 Summary

Failed jobs are now:
- ✅ Clearly visible with red indicators
- ✅ Show clean error messages
- ✅ Provide retry functionality
- ✅ Display in queue with proper status
- ✅ Notify user with toast
- ✅ Allow removal from queue
- ✅ Track count in header

Users can easily identify failures, understand what went wrong, and take action!

