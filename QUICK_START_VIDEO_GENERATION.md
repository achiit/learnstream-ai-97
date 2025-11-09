# Quick Start: Video Generation Feature

Get your AI-powered video generation up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies (if not already done)

```bash
npm install
# or
bun install
```

### 2. Get Your API Keys

#### Gemini API Key (Required)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

#### Manim Server (Required)
- You need the Manim video generation backend running
- Default URL: `http://localhost:5002`
- See the Postman collection for server setup details

### 3. Configure Environment Variables

Create or update `.env` file in project root:

```env
# Existing Supabase config
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Add these for video generation
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_MANIM_API_URL=http://localhost:5002
```

### 4. Start the Development Server

```bash
npm run dev
# or
bun dev
```

### 5. Test It Out!

1. Navigate to `http://localhost:5173`
2. Sign in to your account
3. Go to the **Generate** page
4. Enter a prompt like: **"Explain the Pythagorean theorem"**
5. Click **"Start Assessment & Generate Video"**
6. Answer the 3 assessment questions
7. Watch your video generate in the background! 🎉

## 🎯 What You'll See

### Step 1: Assessment Dialog
- 3 multiple-choice questions appear
- Questions assess your knowledge level
- Beautiful progress indicators
- Takes ~10 seconds total

### Step 2: Video Generation Starts
- Job appears in floating queue (bottom-right)
- Status updates every 5 seconds
- You can navigate away and continue using the app

### Step 3: Video Ready!
- Notification appears when complete
- Click "View" to watch in browser
- Click "Download" to save as MP4

## 🧪 Quick Test

Try this test prompt to verify everything works:

```
Create an animation explaining the Pythagorean theorem. 
Show a right triangle with sides a, b, and hypotenuse c. 
Display the formula a² + b² = c².
```

**Expected result:**
- 3 questions about triangles/geometry
- Complexity level determined (0-5)
- Video generated in 1-3 minutes

## 📊 Features You Can Use

### Multiple Videos
- Generate multiple videos simultaneously
- All tracked in the queue
- Non-blocking UI

### Queue Management
- View all jobs (active, completed, failed)
- Clear completed jobs
- Download any finished video

### Smart Assessment
- AI analyzes your knowledge
- Adjusts video complexity automatically
- More review cycles for beginners

## 🔧 Troubleshooting

### "Gemini API key not configured"
- Check `.env` file exists
- Verify `VITE_GEMINI_API_KEY` is set
- Restart dev server: `npm run dev`

### "Failed to start video generation"
- Verify Manim server is running: `curl http://localhost:5002/health`
- Should return: `{"status": "healthy"}`
- Check `VITE_MANIM_API_URL` in `.env`

### Questions Don't Generate
- Check browser console for errors
- Verify Gemini API key is valid
- Check API quota at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Video Stuck in "Started" Status
- Normal! Video generation takes 1-3 minutes
- Status updates every 5 seconds
- Check Manim server logs for progress

## 📱 Mobile Testing

The feature is fully mobile responsive:
- Assessment dialog adapts to screen size
- Queue panel collapses nicely
- Touch-friendly buttons

## 🎨 Customization

Want to change something?

### Modify Question Count
Edit `src/services/gemini.service.ts`:
```typescript
// Change from 3 to 5 questions
const systemPrompt = `Generate exactly 5 questions...`;
```

### Change Queue Position
Edit `src/components/VideoJobQueue.tsx`:
```typescript
// Move to bottom-left
<div className="fixed bottom-4 left-4 z-50">
```

### Adjust Polling Speed
Edit `src/hooks/useVideoQueue.tsx`:
```typescript
const POLL_INTERVAL = 10000; // 10 seconds
```

## 📚 Full Documentation

For detailed information, see:
- **[VIDEO_GENERATION_SETUP.md](./VIDEO_GENERATION_SETUP.md)** - Complete setup guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[Postman Collection](Downloads/Manim_Video_API.postman_collection.json)** - API reference

## 🎉 You're All Set!

Your AI-powered video generation system is ready to use. Start creating personalized learning videos!

---

**Need Help?**
- Check the troubleshooting section above
- Review browser console for errors
- Verify all environment variables are set
- Test Manim API with Postman

**Happy Learning! 🚀**

