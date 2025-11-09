# Video Generation Setup Guide

This guide explains how to set up and use the AI-powered video generation feature with Gemini assessment and Manim video API.

## 🎯 Overview

The video generation flow consists of three main steps:

1. **User Input**: User enters a topic they want to learn
2. **AI Assessment**: Gemini generates 3 questions to assess user's knowledge level
3. **Video Generation**: Based on assessment results, Manim API generates a personalized video

## 📋 Prerequisites

### 1. Gemini API Key

You need a Google Gemini API key for AI-powered assessment generation.

**Get your API key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key" or "Create API Key"
3. Copy the generated API key

### 2. Manim Video Generation Server

You need the Manim video generation backend running.

**Server Requirements:**
- Python backend with Manim
- Running on `http://localhost:5002` (default)
- See the Postman collection for API details

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (copy from `env.example`):

```bash
# Supabase (existing)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Gemini API (new)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Manim API (new)
VITE_MANIM_API_URL=http://localhost:5002
```

### API Endpoints

The Manim API should support these endpoints:

- `GET /health` - Health check
- `POST /api/v1/generate` - Start video generation
- `GET /api/v1/status/{job_id}` - Check generation status
- `GET /api/v1/video/{job_id}` - Download video
- `GET /api/v1/jobs` - List all jobs

See `/Users/achintya/Downloads/Manim_Video_API.postman_collection.json` for full API documentation.

## 🚀 Usage Flow

### Step 1: User Enters Prompt

User enters what they want to learn, for example:
```
"Explain the Pythagorean theorem"
```

### Step 2: AI Assessment

When user clicks "Start Assessment & Generate Video":

1. **Question Generation**: Gemini API generates 3 multiple-choice questions
2. **Assessment Dialog**: User answers the questions in a modal
3. **Analysis**: Gemini analyzes answers to determine:
   - Complexity Level (0-5)
   - Enhanced Prompt (max 500 chars)
   - Review Count (1-5)

Example assessment questions for Pythagorean theorem:
- "What is your understanding of triangles?"
- "Have you worked with algebraic equations before?"
- "How familiar are you with geometric concepts?"

### Step 3: Video Generation

Based on assessment results:

1. **API Call**: Frontend calls Manim API with:
   ```json
   {
     "prompt": "Enhanced prompt from Gemini",
     "enable_audio": false,
     "review_cycles": 2
   }
   ```

2. **Job Queuing**: Video generation job is added to the queue
3. **Background Processing**: Job runs in background while user can continue using the app
4. **Status Updates**: Queue polls status every 5 seconds
5. **Completion**: User receives notification when video is ready

## 🎨 Features

### Assessment Dialog
- 3 multiple-choice questions
- Progress indicator
- Clean, intuitive UI
- Mobile responsive

### Video Job Queue
- Floating panel in bottom-right corner
- Shows all video generation jobs
- Real-time status updates
- Non-blocking - user can navigate away
- Actions: View, Download, Remove

### Intelligent Prompt Enhancement

The system enhances user prompts based on assessment:

**User knowledge level 0/3 correct:**
- Complexity: 0-1
- Review cycles: 4-5
- Prompt style: "Explain from absolute basics..."

**User knowledge level 3/3 correct:**
- Complexity: 4-5
- Review cycles: 1-2
- Prompt style: "Explain with advanced concepts..."

## 📂 File Structure

```
src/
├── services/
│   ├── gemini.service.ts      # Gemini API integration
│   └── manim.service.ts       # Manim video API integration
├── hooks/
│   └── useVideoQueue.tsx      # Video queue management
├── components/
│   ├── AssessmentDialog.tsx   # Question dialog component
│   └── VideoJobQueue.tsx      # Floating queue panel
└── pages/
    └── Generate.tsx           # Main generation page
```

## 🔍 API Integration Details

### Gemini Service

**Methods:**
- `generateAssessmentQuestions(prompt)` - Generate 3 questions
- `analyzeAssessmentResults(prompt, questions, answers)` - Analyze and create enhanced prompt

**Response Format:**
```typescript
{
  complexityLevel: 0-5,
  enhancedPrompt: "max 500 chars",
  reviewCount: 1-5
}
```

### Manim Service

**Methods:**
- `healthCheck()` - Check if API is running
- `generateVideo(request)` - Start video generation
- `getJobStatus(jobId)` - Get current status
- `downloadVideo(jobId)` - Download completed video
- `pollJobUntilComplete(jobId, callback)` - Auto-poll until done

**Job Statuses:**
- `queued` - Waiting to start
- `started` - Currently processing
- `finished` - Ready to download
- `failed` - Generation failed

## 🎯 Example Flow

### Complete User Journey

1. **User Action**: "Explain photosynthesis"
   
2. **Assessment Questions Generated**:
   - "What do you know about plants?"
   - "Have you studied cellular biology?"
   - "How familiar are you with chemical processes?"

3. **User Answers**: 1/3 correct (beginner level)

4. **Gemini Analysis**:
   ```json
   {
     "complexityLevel": 1,
     "enhancedPrompt": "Explain photosynthesis starting with the basics: what plants need (sunlight, water, CO2) and how they make food. Use simple animations to show the process step-by-step with clear labels.",
     "reviewCount": 4
   }
   ```

5. **Manim API Call**:
   ```json
   {
     "prompt": "Explain photosynthesis starting with...",
     "enable_audio": false,
     "review_cycles": 4
   }
   ```

6. **Job Progress**:
   - Status: `queued` → "Queued"
   - Status: `started` → "Review cycle 1/4"
   - Status: `started` → "Review cycle 2/4"
   - Status: `started` → "Review cycle 3/4"
   - Status: `started` → "Review cycle 4/4"
   - Status: `finished` → "Complete"

7. **User receives notification**: "Video ready! Photosynthesis"

8. **User can**:
   - View in browser
   - Download MP4
   - Generate more videos while this one processes

## 🛠️ Troubleshooting

### Gemini API Issues

**Error: "Gemini API key not configured"**
- Ensure `VITE_GEMINI_API_KEY` is set in `.env`
- Restart dev server after adding the key

**Error: "Invalid API key"**
- Verify your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check for extra spaces or quotes

**Fallback Behavior**: If Gemini API fails, the system uses pre-defined generic questions.

### Manim API Issues

**Error: "Failed to start video generation"**
- Check if Manim server is running: `curl http://localhost:5002/health`
- Verify `VITE_MANIM_API_URL` in `.env`

**Error: "Video not ready yet"**
- Video is still processing, wait for status to become "finished"
- Normal generation time: 1-3 minutes

**CORS Issues**: If running on different domains, ensure Manim API has proper CORS headers.

### Queue Issues

**Jobs not updating**:
- Queue polls every 5 seconds automatically
- Check browser console for errors
- Verify job_id is valid

**Jobs lost after refresh**:
- Jobs are stored in localStorage
- Should persist across page refreshes
- Check browser localStorage is enabled

## 🎓 Best Practices

### For Users
1. Be specific in prompts (e.g., "Explain calculus derivatives" not just "math")
2. Answer assessment questions honestly for best results
3. You can generate multiple videos simultaneously
4. Queue persists - you can close the tab and come back

### For Developers
1. Always validate Gemini responses (malformed JSON handling)
2. Implement retry logic for API failures
3. Keep prompts under 500 chars for optimal Manim performance
4. Monitor queue size to avoid memory issues
5. Clear completed jobs periodically

## 📊 Performance Metrics

**Expected Timings:**
- Question generation: 2-5 seconds
- Assessment analysis: 2-4 seconds
- Video generation: 60-180 seconds (1-3 minutes)

**API Rate Limits:**
- Gemini: 60 requests/minute (free tier)
- Manim: Depends on your server capacity

## 🔐 Security Notes

1. API keys should **never** be committed to git
2. Use `.env` file (already in `.gitignore`)
3. Gemini API key is client-side (safe for VITE_ prefix)
4. Consider backend proxy for production
5. Validate all user inputs before sending to APIs

## 📱 Mobile Support

- Assessment dialog is fully responsive
- Video queue collapses on mobile
- Touch-friendly buttons and controls
- Optimized for small screens

## 🚀 Future Enhancements

Potential improvements:
- [ ] Voice narration option (`enable_audio: true`)
- [ ] Save assessment results to database
- [ ] Video history and favorites
- [ ] Share videos with other users
- [ ] Custom review cycle selection
- [ ] Video quality settings
- [ ] Batch video generation

## 📞 Support

If you encounter issues:
1. Check this documentation
2. Review browser console for errors
3. Verify all environment variables
4. Check Manim server logs
5. Test API endpoints with Postman

## 🎉 Success!

You should now have:
- ✅ Working Gemini assessment
- ✅ Manim video generation
- ✅ Non-blocking job queue
- ✅ Complete user flow

Happy learning! 🎓

