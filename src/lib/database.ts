import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Profile operations
export const profileOperations = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: TablesUpdate<'profiles'>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Learning session operations
export const learningSessionOperations = {
  async createSession(session: TablesInsert<'learning_sessions'>) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSession(sessionId: string) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserSessions(userId: string) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateSession(sessionId: string, updates: TablesUpdate<'learning_sessions'>) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSession(sessionId: string) {
    const { error } = await supabase
      .from('learning_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  },
};

// Generated video operations
export const videoOperations = {
  async createVideo(video: TablesInsert<'generated_videos'>) {
    const { data, error } = await supabase
      .from('generated_videos')
      .insert(video)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getVideo(videoId: string) {
    const { data, error } = await supabase
      .from('generated_videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error) throw error;
    return data;
  },

  async getSessionVideos(sessionId: string) {
    const { data, error } = await supabase
      .from('generated_videos')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserVideos(userId: string) {
    const { data, error } = await supabase
      .from('generated_videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateVideo(videoId: string, updates: TablesUpdate<'generated_videos'>) {
    const { data, error } = await supabase
      .from('generated_videos')
      .update(updates)
      .eq('id', videoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVideo(videoId: string) {
    const { error } = await supabase
      .from('generated_videos')
      .delete()
      .eq('id', videoId);

    if (error) throw error;
  },
};

// Learning progress operations
export const progressOperations = {
  async getProgress(userId: string, videoId: string) {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProgress(progress: TablesInsert<'learning_progress'>) {
    const { data, error } = await supabase
      .from('learning_progress')
      .upsert(progress)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCompletedVideos(userId: string) {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*, generated_videos(*)')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// Storage operations for file uploads
export const storageOperations = {
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    return data;
  },

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  },

  async listFiles(bucket: string, folder: string = '') {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) throw error;
    return data;
  },
};

// Chat message operations
export const chatMessageOperations = {
  async createMessage(message: TablesInsert<'chat_messages'>) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserMessages(userId: string, limit?: number) {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getSessionMessages(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  },

  async deleteUserMessages(userId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },
};

// Combined database operations
export const db = {
  profiles: profileOperations,
  sessions: learningSessionOperations,
  videos: videoOperations,
  progress: progressOperations,
  storage: storageOperations,
  chat: chatMessageOperations,
};

