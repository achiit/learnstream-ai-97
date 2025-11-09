import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { db } from '@/lib/database';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export function useVideo() {
  const { user } = useUser();
  const [videos, setVideos] = useState<Tables<'generated_videos'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  const fetchVideos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await db.videos.getUserVideos(user.id);
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const getSessionVideos = async (sessionId: string) => {
    try {
      const data = await db.videos.getSessionVideos(sessionId);
      return data;
    } catch (error) {
      console.error('Error fetching session videos:', error);
      toast.error('Failed to load session videos');
      return [];
    }
  };

  const createVideo = async (
    sessionId: string,
    videoUrl: string,
    thumbnailUrl?: string,
    duration?: number,
    transcript?: string
  ) => {
    if (!user) {
      toast.error('You must be logged in');
      return null;
    }

    try {
      const video = await db.videos.createVideo({
        session_id: sessionId,
        user_id: user.id,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || null,
        duration: duration || null,
        transcript: transcript || null,
      });

      setVideos((prev) => [video, ...prev]);
      toast.success('Video saved!');
      return video;
    } catch (error) {
      console.error('Error creating video:', error);
      toast.error('Failed to save video');
      return null;
    }
  };

  const updateProgress = async (
    videoId: string,
    progressPercentage: number,
    lastPosition: number,
    completed: boolean = false
  ) => {
    if (!user) return null;

    try {
      const progress = await db.progress.updateProgress({
        user_id: user.id,
        video_id: videoId,
        progress_percentage: progressPercentage,
        last_position: lastPosition,
        completed,
      });

      return progress;
    } catch (error) {
      console.error('Error updating progress:', error);
      return null;
    }
  };

  const getProgress = async (videoId: string) => {
    if (!user) return null;

    try {
      const progress = await db.progress.getProgress(user.id, videoId);
      return progress;
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  };

  return {
    videos,
    loading,
    createVideo,
    getSessionVideos,
    updateProgress,
    getProgress,
    refreshVideos: fetchVideos,
  };
}

