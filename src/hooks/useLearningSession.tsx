import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { db } from '@/lib/database';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { ensureProfileExists } from '@/lib/ensure-profile';

export function useLearningSession() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<Tables<'learning_sessions'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Ensure profile exists before fetching sessions
      ensureProfileExists(user).then(() => {
        fetchSessions();
      });
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await db.sessions.getUserSessions(user.id);
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load learning sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (
    title: string,
    sourceType: 'upload' | 'prompt',
    sourceContent?: string,
    fileUrl?: string,
    description?: string
  ) => {
    if (!user) {
      toast.error('You must be logged in');
      return null;
    }

    try {
      // Ensure profile exists before creating session
      const profileExists = await ensureProfileExists(user);
      if (!profileExists) {
        toast.error('Failed to verify user profile. Please try again.');
        return null;
      }

      console.log('Creating session with:', { user_id: user.id, title, sourceType });
      
      const session = await db.sessions.createSession({
        user_id: user.id,
        title,
        source_type: sourceType,
        source_content: sourceContent || null,
        file_url: fileUrl || null,
        description: description || null,
        status: 'processing',
      });

      console.log('Session created successfully:', session);
      setSessions((prev) => [session, ...prev]);
      toast.success('Learning session created!');
      return session;
    } catch (error: any) {
      console.error('Error creating session:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      // Provide more specific error messages
      if (error?.code === '42P01' || error?.code === 'PGRST205') {
        toast.error('Database tables not created. Please check DATABASE_SETUP.md');
      } else if (error?.code === '23503') {
        toast.error('User profile error. Please refresh the page and try again.');
      } else {
        toast.error(`Failed to create session: ${error?.message || 'Unknown error'}`);
      }
      return null;
    }
  };

  const updateSessionStatus = async (
    sessionId: string,
    status: 'processing' | 'completed' | 'failed'
  ) => {
    try {
      const updated = await db.sessions.updateSession(sessionId, { status });
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updated : s))
      );
      return updated;
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session');
      return null;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await db.sessions.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success('Session deleted');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  return {
    sessions,
    loading,
    createSession,
    updateSessionStatus,
    deleteSession,
    refreshSessions: fetchSessions,
  };
}

