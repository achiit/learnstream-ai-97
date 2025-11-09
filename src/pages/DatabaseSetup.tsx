import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Copy, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const DatabaseSetup = () => {
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState({
    connected: false,
    profilesTable: false,
    sessionsTable: false,
    videosTable: false,
    progressTable: false,
  });
  const [userProfileExists, setUserProfileExists] = useState<boolean | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);

  const sqlMigration = `-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create learning_sessions table
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'prompt')),
    source_content TEXT,
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create generated_videos table
CREATE TABLE IF NOT EXISTS public.generated_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    transcript TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create learning_progress table
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.generated_videos(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_position INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id, video_id)
);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_learning_sessions_updated_at
    BEFORE UPDATE ON public.learning_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_generated_videos_updated_at
    BEFORE UPDATE ON public.generated_videos
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_learning_progress_updated_at
    BEFORE UPDATE ON public.learning_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create RLS policies for learning_sessions
CREATE POLICY "Users can view their own learning sessions"
    ON public.learning_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning sessions"
    ON public.learning_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning sessions"
    ON public.learning_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning sessions"
    ON public.learning_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for generated_videos
CREATE POLICY "Users can view their own generated videos"
    ON public.generated_videos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated videos"
    ON public.generated_videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated videos"
    ON public.generated_videos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated videos"
    ON public.generated_videos FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for learning_progress
CREATE POLICY "Users can view their own learning progress"
    ON public.learning_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning progress"
    ON public.learning_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress"
    ON public.learning_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning progress"
    ON public.learning_progress FOR DELETE
    USING (auth.uid() = user_id);

-- Create chat_messages table for storing live interaction messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON public.learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_created_at ON public.learning_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_session_id ON public.generated_videos(session_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_id ON public.generated_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_video_id ON public.learning_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Enable Row Level Security for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
    ON public.chat_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
    ON public.chat_messages FOR DELETE
    USING (auth.uid() = user_id);`;

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    setChecking(true);
    const newStatus = {
      connected: false,
      profilesTable: false,
      sessionsTable: false,
      videosTable: false,
      progressTable: false,
    };

    try {
      // Check connection
      const { error: connectionError } = await supabase.from('profiles').select('count').limit(1);
      
      if (connectionError) {
        if (connectionError.code === 'PGRST204' || connectionError.code === 'PGRST205' || connectionError.code === '42P01') {
          newStatus.connected = true; // Connected but tables don't exist
        }
      } else {
        newStatus.connected = true;
        newStatus.profilesTable = true;
      }

      // Check learning_sessions
      const { error: sessionsError } = await supabase.from('learning_sessions').select('count').limit(1);
      if (!sessionsError) newStatus.sessionsTable = true;

      // Check generated_videos
      const { error: videosError } = await supabase.from('generated_videos').select('count').limit(1);
      if (!videosError) newStatus.videosTable = true;

      // Check learning_progress
      const { error: progressError } = await supabase.from('learning_progress').select('count').limit(1);
      if (!progressError) newStatus.progressTable = true;

      // Check if current user's profile exists
      if (newStatus.profilesTable) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
          
          setUserProfileExists(!!profile && !profileError);
        }
      }

    } catch (error) {
      console.error('Error checking database:', error);
    }

    setStatus(newStatus);
    setChecking(false);
  };

  const createUserProfile = async () => {
    setCreatingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('No user logged in');
        return;
      }

      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast.success('Profile already exists!');
          setUserProfileExists(true);
        } else {
          throw error;
        }
      } else {
        toast.success('Profile created successfully!');
        setUserProfileExists(true);
      }
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error(`Failed to create profile: ${error.message}`);
    } finally {
      setCreatingProfile(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlMigration);
    toast.success("SQL copied to clipboard!");
  };

  const openSupabaseDashboard = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
    if (projectId) {
      window.open(`https://supabase.com/dashboard/project/${projectId}/sql/new`, '_blank');
    } else {
      window.open('https://supabase.com/dashboard', '_blank');
    }
  };

  const allTablesExist = status.profilesTable && status.sessionsTable && status.videosTable && status.progressTable;

  return (
    <Layout showAuth>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Database Setup</h1>
            <p className="text-muted-foreground">
              Check your database status and set up required tables
            </p>
          </div>

          {/* Status Card */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Database Status</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {checking ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                ) : status.connected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">Supabase Connection</span>
              </div>

              <div className="flex items-center gap-3 pl-8">
                {status.profilesTable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>profiles table</span>
              </div>

              <div className="flex items-center gap-3 pl-8">
                {status.sessionsTable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>learning_sessions table</span>
              </div>

              <div className="flex items-center gap-3 pl-8">
                {status.videosTable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>generated_videos table</span>
              </div>

              <div className="flex items-center gap-3 pl-8">
                {status.progressTable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>learning_progress table</span>
              </div>

              {allTablesExist && userProfileExists !== null && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                  {userProfileExists ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">Your Profile</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={checkDatabaseStatus} variant="outline">
                Refresh Status
              </Button>
              
              {allTablesExist && userProfileExists === false && (
                <Button 
                  onClick={createUserProfile} 
                  disabled={creatingProfile}
                  className="bg-[#FF8B6D] hover:bg-[#FF7654]"
                >
                  {creatingProfile ? 'Creating...' : 'Create My Profile'}
                </Button>
              )}
            </div>
          </Card>

          {/* Instructions Card */}
          {!allTablesExist && status.connected && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Setup Required</h2>
              
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your database tables need to be created. Follow the steps below to set them up.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 1: Copy SQL</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Click the button below to copy the database setup SQL to your clipboard.
                  </p>
                  <Button onClick={copyToClipboard} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy SQL to Clipboard
                  </Button>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 2: Open Supabase SQL Editor</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Click the button below to open your Supabase project's SQL Editor in a new tab.
                  </p>
                  <Button onClick={openSupabaseDashboard} variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open Supabase SQL Editor
                  </Button>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 3: Run the SQL</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>In the SQL Editor, paste the copied SQL (Ctrl+V or Cmd+V)</li>
                    <li>Click the green "RUN" button in the bottom right</li>
                    <li>Wait for "Success. No rows returned" message</li>
                    <li>Come back here and click "Refresh Status" above</li>
                  </ol>
                </div>
              </div>
            </Card>
          )}

          {!status.connected && !checking && (
            <Card className="p-6 bg-red-50 dark:bg-red-950 border-red-200">
              <h2 className="text-2xl font-bold mb-4 text-red-900 dark:text-red-100">Connection Failed</h2>
              <p className="text-red-800 dark:text-red-200 mb-4">
                Unable to connect to Supabase. Please check your environment variables:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                <li>VITE_SUPABASE_URL is set correctly in .env</li>
                <li>VITE_SUPABASE_ANON_KEY is set correctly in .env</li>
                <li>You've restarted your development server after changing .env</li>
              </ul>
            </Card>
          )}

          {allTablesExist && userProfileExists === true && (
            <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">All Set!</h2>
              </div>
              <p className="text-green-800 dark:text-green-200">
                Your database is properly configured and your profile exists. You can now use all features of the application!
              </p>
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700" 
                onClick={() => window.location.href = '/dashboard'}
              >
                Go to Dashboard
              </Button>
            </Card>
          )}

          {allTablesExist && userProfileExists === false && (
            <Card className="p-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">Profile Missing</h2>
              </div>
              <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                Your database tables are set up, but your user profile doesn't exist yet. This happens when you signed up before the tables were created.
              </p>
              <p className="text-yellow-800 dark:text-yellow-200 mb-4 font-semibold">
                Choose one of these options:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-yellow-900 dark:text-yellow-100">Option 1:</span>
                  <div>
                    <p className="text-yellow-800 dark:text-yellow-200">Click the "Create My Profile" button above to automatically create your profile.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-yellow-900 dark:text-yellow-100">Option 2:</span>
                  <div>
                    <p className="text-yellow-800 dark:text-yellow-200">Sign out and sign back in. The system will automatically create your profile when you sign in.</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DatabaseSetup;

