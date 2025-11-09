# Debugging Failed Status Not Showing

## 🔍 Debug Logs Added

I've added comprehensive logging to help diagnose why the failed status isn't appearing in the UI.

### What to Check in Browser Console

1. **Refresh your browser** to load the updated code

2. **Open Browser Console** (F12 or Cmd+Option+I)

3. **Look for these log messages:**

#### When Polling Happens:
```
[ManimService] Job a98eccd2 status: {
  job_id: "a98eccd2-06fd-4077-ab91-cab404cf2fdf",
  status: "failed",
  error: "[bold red]Max retries exceeded.[/bold red]",
  progress: "Review cycle 1/4",
  ...
}
```

#### When Queue Updates:
```
[VideoQueue] Polling job a98eccd2-06fd-4077-ab91-cab404cf2fdf: {
  currentStatus: "started",
  newStatus: "failed",
  progress: "Review cycle 1/4",
  error: "[bold red]Max retries exceeded.[/bold red]"
}
```

#### When State Updates:
```
[VideoQueue] Updated job a98eccd2: {
  job_id: "a98eccd2-06fd-4077-ab91-cab404cf2fdf",
  status: "failed",
  error: "Max retries exceeded.",
  ...
}
```

#### When Job Fails:
```
[VideoQueue] Job a98eccd2-06fd-4077-ab91-cab404cf2fdf failed! [bold red]Max retries exceeded.[/bold red]
```

#### Queue State Changes:
```
[VideoQueue] Queue updated: [
  { id: "a98eccd2", status: "failed", prompt: "explain the sine curve" }
]
```

## 🐛 Common Issues

### Issue 1: Status Never Changes to "failed"
**Symptom:** Logs show `newStatus: "started"` repeatedly
**Cause:** Manim API not returning `status: "failed"`
**Solution:** Check Manim server logs

### Issue 2: Status Changes But UI Doesn't Update
**Symptom:** See "Updated job" log but UI shows old status
**Cause:** React state update issue
**Solution:** Check if queue prop is being passed correctly

### Issue 3: Toast Appears But Badge Stays Same
**Symptom:** See error toast but queue shows "Processing"
**Cause:** State update timing issue
**Solution:** Check console logs for state updates

### Issue 4: Job Disappears from Queue
**Symptom:** Job vanishes when it fails
**Cause:** activeJobs filter removing it too quickly
**Solution:** Already handled - job stays in queue after status change

## 🧪 Testing Steps

### Step 1: Check API Response
In console, look for `[ManimService]` logs. The response should contain:
```json
{
  "status": "failed",
  "error": "error message here"
}
```

**If you don't see `status: "failed"`**, the Manim API isn't returning the right status.

### Step 2: Check Polling Detection
Look for `[VideoQueue] Polling job` logs. Should show:
```
currentStatus: "started" or "queued"
newStatus: "failed"
```

**If `newStatus` is not "failed"**, the polling isn't detecting the status change.

### Step 3: Check State Update
Look for `[VideoQueue] Updated job` logs. Should show:
```
status: "failed"
```

**If status is still "started" or "queued"**, the state update isn't working.

### Step 4: Check Toast Notification
Should see:
```
[VideoQueue] Job xxx failed! error message
```
And a toast notification appears.

**If no toast**, the condition `job.status !== 'failed'` is already true (meaning job was already marked as failed).

### Step 5: Visual Check
Look at the queue panel (bottom-right):
- Icon should be red X ❌
- Badge should say "Failed" in red
- Error message box should appear

## 📊 Expected Log Sequence

When a job fails, you should see this sequence:

```
1. [ManimService] Job a98eccd2 status: { status: "failed", ... }
   ↓
2. [VideoQueue] Polling job a98eccd2: { currentStatus: "started", newStatus: "failed" }
   ↓
3. [VideoQueue] Updated job a98eccd2: { status: "failed", ... }
   ↓
4. [VideoQueue] Job a98eccd2 failed! error message
   ↓
5. [VideoQueue] Queue updated: [{ id: "a98eccd2", status: "failed", ... }]
   ↓
6. Toast: "Video Generation Failed"
   ↓
7. UI updates: Red X, Failed badge, Error box
```

## 🔧 Manual Check

If logs look correct but UI doesn't update:

1. **Check React DevTools**:
   - Find `VideoJobQueue` component
   - Check `queue` prop
   - Verify the job has `status: "failed"`

2. **Check localStorage**:
   ```javascript
   // In console:
   JSON.parse(localStorage.getItem('video-job-queue'))
   ```
   Should show your job with `status: "failed"`

3. **Force Re-render**:
   - Collapse and expand the queue panel
   - Navigate away and back
   - Refresh the page

## 🎯 Quick Test

Run this in browser console to see the current queue state:
```javascript
const queue = JSON.parse(localStorage.getItem('video-job-queue') || '[]');
console.table(queue.map(j => ({
  id: j.job_id.substring(0, 8),
  status: j.status,
  error: j.error,
  prompt: j.userPrompt
})));
```

## 📝 What to Report

If the issue persists, copy and paste these console logs:

1. All `[ManimService]` logs for your job_id
2. All `[VideoQueue]` logs for your job_id
3. The localStorage queue state
4. Any React errors in console

## ✅ Checklist

After refreshing:
- [ ] Console shows `[ManimService]` logs with status
- [ ] Console shows `[VideoQueue] Polling job` logs
- [ ] Console shows `[VideoQueue] Updated job` logs
- [ ] Console shows `[VideoQueue] Job xxx failed!` log
- [ ] Toast notification appears
- [ ] Queue panel shows red X icon
- [ ] Queue panel shows "Failed" badge
- [ ] Error message box appears
- [ ] localStorage has correct status

## 🚀 Next Steps

1. **Refresh your browser now**
2. **Open console (F12)**
3. **Wait for next poll** (happens every 5 seconds)
4. **Check the logs** as described above
5. **Report what you see** - copy the console logs

The detailed logging will help us see exactly where the issue is!

