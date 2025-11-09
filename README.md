# LearnStream AI - Adaptive Learning Platform

An AI-powered adaptive learning platform that generates personalized educational videos from textbooks and custom prompts.

## 🚀 Features

### Authentication & User Management
- 🔐 **Email/Password Authentication** - Traditional sign up and sign in
- 🔑 **Google OAuth** - One-click sign in with Google account
- 👤 **User Profiles** - Customizable user profiles with avatars
- 🔒 **Protected Routes** - Secure access to authenticated features
- 📧 **Email Confirmation** - Verify user emails for security
- 🔄 **Password Reset** - Easy password recovery

### Learning Management
- 📚 **Textbook Upload** - Upload textbook pages for AI processing
- 💡 **Custom Prompts** - Generate content from custom topics
- 🎥 **Video Generation** - AI-generated educational videos with Manim
- 🧠 **Smart Assessment** - AI-powered knowledge level detection with Gemini
- 🎯 **Adaptive Learning** - Videos personalized to your understanding
- 📊 **Learning Sessions** - Track all learning activities
- 📈 **Progress Tracking** - Monitor video watch progress
- 🗂️ **Session History** - View and manage past sessions
- 🔄 **Job Queue** - Non-blocking video generation in background

### Database & Storage
- 💾 **PostgreSQL Database** - Powered by Supabase
- 🔐 **Row Level Security** - User data isolation
- 📁 **File Storage** - Upload and store files securely
- ⚡ **Real-time Updates** - Live data synchronization
- 🔍 **Type-safe Queries** - Full TypeScript support

### Modern UI/UX
- 🎨 **Beautiful Interface** - Modern, responsive design
- 🌓 **Theme Support** - Ready for dark/light modes
- 📱 **Mobile Responsive** - Works on all devices
- ✨ **Smooth Animations** - Delightful user experience
- 🔔 **Toast Notifications** - User feedback for all actions

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or bun package manager
- Supabase account (free tier available)
- Google Cloud account (for OAuth)
- Google Gemini API key (for AI assessment)
- Manim Video Generation server (for video creation)

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd learnstream-ai-97
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Supabase**:
   - Create a project at [app.supabase.com](https://app.supabase.com)
   - Run the migration from `supabase/migrations/001_initial_schema.sql`
   - Get your API credentials

4. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   
   # For video generation features (required)
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_MANIM_API_URL=http://localhost:5002
   ```

5. **Set up Google OAuth** (optional but recommended):
   - Follow the guide in [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)
   - Configure Google Cloud Console
   - Add credentials to Supabase

6. **Set up Video Generation** (required for video features):
   - Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Set up Manim video generation server (see [VIDEO_GENERATION_SETUP.md](./VIDEO_GENERATION_SETUP.md))
   - Update `.env` with your API keys

7. **Start the development server**:
   ```bash
   npm run dev
   # or
   bun dev
   ```

8. **Open your browser**:
   Navigate to `http://localhost:5173`

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase setup guide
- **[GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)** - Google OAuth configuration
- **[VIDEO_GENERATION_SETUP.md](./VIDEO_GENERATION_SETUP.md)** - ⭐ AI video generation guide (NEW!)
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API documentation

## 🏗️ Project Structure

```
learnstream-ai-97/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx      # Authentication hook
│   │   ├── useUser.tsx      # User profile hook
│   │   ├── useLearningSession.tsx
│   │   └── useVideo.tsx
│   ├── pages/               # Route pages
│   │   ├── Landing.tsx      # Landing page
│   │   ├── Auth.tsx         # Authentication page
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   └── ...
│   ├── lib/                 # Utility libraries
│   │   ├── database.ts      # Database operations
│   │   └── utils.ts         # Helper functions
│   ├── integrations/        # Third-party integrations
│   │   └── supabase/        # Supabase client & types
│   └── App.tsx              # Main app component
├── supabase/
│   └── migrations/          # Database migrations
├── public/                  # Static assets
└── ...config files
```

## 🔧 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend & Database
- **Supabase** - Backend as a service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - File storage
  - Real-time subscriptions
- **Google Gemini** - AI assessment and analysis
- **Manim** - Animated video generation

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get up and running quickly
- **[Database Setup](DATABASE_SETUP.md)** - Database configuration
- **[Supabase Setup](SUPABASE_SETUP.md)** - Supabase integration
- **[Google Auth Setup](GOOGLE_AUTH_SETUP.md)** - OAuth configuration
- **[Video Generation Setup](VIDEO_GENERATION_SETUP.md)** - ⭐ AI video generation guide
- **[API Reference](API_REFERENCE.md)** - API documentation

## 🎯 Usage Examples

### Sign In with Google
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginButton() {
  const { signInWithGoogle } = useAuth();
  
  return (
    <button onClick={() => signInWithGoogle()}>
      Sign in with Google
    </button>
  );
}
```

### Create Learning Session
```typescript
import { useLearningSession } from '@/hooks/useLearningSession';

function CreateSession() {
  const { createSession } = useLearningSession();
  
  const handleCreate = async () => {
    await createSession(
      'Photosynthesis',
      'prompt',
      'Explain photosynthesis in plants...'
    );
  };
  
  return <button onClick={handleCreate}>Create</button>;
}
```

### Track Video Progress
```typescript
import { useVideo } from '@/hooks/useVideo';

function VideoPlayer({ videoId }) {
  const { updateProgress } = useVideo();
  
  const handleProgress = async (percent, position) => {
    await updateProgress(videoId, percent, position);
  };
  
  // Use in your video player
}
```

## 🔐 Security

- **Row Level Security (RLS)** - Users can only access their own data
- **Environment Variables** - Sensitive data stored securely
- **Protected Routes** - Authentication required for sensitive pages
- **OAuth 2.0** - Secure Google authentication
- **Email Verification** - Confirm user emails
- **Secure Sessions** - Automatic token refresh

## 🚀 Deployment

### Prerequisites
- Vercel/Netlify account (or your preferred hosting)
- Production Supabase project
- Production Google OAuth credentials

### Steps

1. **Update environment variables**:
   Set production values for:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

2. **Configure OAuth redirect URLs**:
   - Add production URLs to Google Cloud Console
   - Update Supabase redirect URLs

3. **Deploy**:
   ```bash
   npm run build
   # Deploy the dist/ folder
   ```

4. **Verify**:
   - Test authentication flows
   - Check database connections
   - Verify file uploads

## 🧪 Development

### Run in development mode:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Lint code:
```bash
npm run lint
```

## 🐛 Troubleshooting

### Authentication Issues
- Check `.env` file has correct values
- Verify Supabase project is active
- Check browser console for errors
- Review Supabase Auth logs

### Database Errors
- Ensure migrations are run
- Check RLS policies are enabled
- Verify user permissions
- Review Supabase logs

### Google OAuth Issues
- Verify redirect URIs match exactly
- Check OAuth consent screen is configured
- Ensure credentials are correct
- Add test users in development

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed troubleshooting.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Shadcn/ui](https://ui.shadcn.com) - UI components
- [Vite](https://vitejs.dev) - Build tool
- [React](https://react.dev) - UI library

## 📞 Support

For help and support:
1. Check the [documentation](./QUICK_START.md)
2. Review [API reference](./API_REFERENCE.md)
3. Check [GitHub issues](https://github.com/your-repo/issues)
4. Contact the development team

---

**Built with ❤️ for adaptive learning**

Get started now: [QUICK_START.md](./QUICK_START.md)
