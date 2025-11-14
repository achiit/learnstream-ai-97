/**
 * Video Queue Hook
 * Manages video generation jobs in a queue for non-blocking UI
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { manimService, VideoJobStatus } from '@/services/manim.service';
import { toast } from 'sonner';

export interface QueuedJob extends VideoJobStatus {
  userPrompt: string;
  addedAt: Date;
  videoUrl?: string;
}

const POLL_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = 'video-job-queue';

export function useVideoQueue() {
  const [queue, setQueue] = useState<QueuedJob[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queueRef = useRef<QueuedJob[]>([]);

  // Load queue from localStorage on mount
  useEffect(() => {
    const loadQueue = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          const queue = parsed.map((job: any) => ({
            ...job,
            addedAt: new Date(job.addedAt),
          }));
          setQueue(queue);
        }
      } catch (error) {
        console.error('Error loading queue from storage:', error);
      }
    };

    loadQueue();
  }, []);

  // Keep queueRef in sync with queue
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    try {
      console.log('[VideoQueue] Queue updated:', queue.map(j => ({ 
        id: j.job_id.substring(0, 8), 
        status: j.status,
        prompt: j.userPrompt.substring(0, 30)
      })));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving queue to storage:', error);
    }
  }, [queue]);

  // Add a new job to the queue
  const addJob = useCallback((job: VideoJobStatus, userPrompt: string) => {
    const queuedJob: QueuedJob = {
      ...job,
      userPrompt,
      addedAt: new Date(),
    };

    setQueue((prev) => [queuedJob, ...prev]);
    
    toast.success('Video generation started!', {
      description: 'Your video is being created in the background.',
    });
  }, []);

  // Remove a job from the queue
  const removeJob = useCallback((jobId: string) => {
    setQueue((prev) => prev.filter((job) => job.job_id !== jobId));
    toast.info('Job removed from queue');
  }, []);

  // Clear all completed/failed jobs
  const clearCompleted = useCallback(() => {
    setQueue((prev) => 
      prev.filter((job) => job.status !== 'finished' && job.status !== 'failed')
    );
    toast.info('Cleared completed jobs');
  }, []);

  // Update a specific job's status
  const updateJobStatus = useCallback((jobId: string, status: Partial<VideoJobStatus>) => {
    console.log(`[VideoQueue] Updating job ${jobId} with:`, status);
    setQueue((prev) => {
      const oldJob = prev.find(j => j.job_id === jobId);
      console.log(`[VideoQueue] Old job state:`, oldJob);
      
      const updated = prev.map((job) =>
        job.job_id === jobId ? { ...job, ...status } : job
      );
      
      const newJob = updated.find(j => j.job_id === jobId);
      console.log(`[VideoQueue] New job state:`, newJob);
      
      return updated;
    });
  }, []);

  // Track active job IDs - only changes when jobs are added/removed, not when status changes
  const activeJobIds = useMemo(() => {
    return queue
      .filter((job) => job.status === 'queued' || job.status === 'started')
      .map((job) => job.job_id)
      .sort()
      .join(',');
  }, [queue]);

  // Poll active jobs for status updates
  useEffect(() => {
    // Get active job IDs (only track IDs, not full job objects)
    const activeJobIdList = activeJobIds ? activeJobIds.split(',').filter(Boolean) : [];

    console.log('[VideoQueue] Active jobs to poll:', activeJobIdList.length, activeJobIdList.map(id => id.substring(0, 8)));

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (activeJobIdList.length === 0) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    const pollJobs = async () => {
      // Get current active jobs from ref (always use latest state)
      const currentQueue = queueRef.current;
      const activeJobs = currentQueue.filter(
        (job) => job.status === 'queued' || job.status === 'started'
      );

      // If no active jobs, stop polling
      if (activeJobs.length === 0) {
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      for (const job of activeJobs) {
        try {
          const status = await manimService.getJobStatus(job.job_id);
          
          console.log(`[VideoQueue] Polling job ${job.job_id}:`, {
            currentStatus: job.status,
            newStatus: status.status,
            progress: status.progress,
            error: status.error
          });
          
          // Update job status
          updateJobStatus(job.job_id, status);

          // If job is finished, show success notification
          if (status.status === 'finished' && job.status !== 'finished') {
            console.log(`[VideoQueue] Job ${job.job_id} completed!`);
            toast.success('Video ready!', {
              description: `"${job.userPrompt}" has been generated.`,
              action: {
                label: 'View',
                onClick: () => {
                  // This will be handled by the component
                  window.dispatchEvent(
                    new CustomEvent('video-ready', { detail: { jobId: job.job_id } })
                  );
                },
              },
            });

            // Try to get video URL
            try {
              const videoUrl = await manimService.downloadVideo(job.job_id);
              updateJobStatus(job.job_id, { videoUrl } as any);
            } catch (error) {
              console.error('Error getting video URL:', error);
            }
          }

          // If job failed, show error notification and auto-remove
          if (status.status === 'failed' && job.status !== 'failed') {
            console.log(`[VideoQueue] Job ${job.job_id} failed!`, status.error);
            // Clean up error message (remove rich text formatting)
            const cleanError = status.error 
              ? status.error.replace(/\[bold red\]/g, '').replace(/\[\/bold red\]/g, '').trim()
              : 'An unknown error occurred';
            
            toast.error('Video Generation Failed', {
              description: `${job.userPrompt}: ${cleanError}`,
              duration: 8000, // Show toast for 8 seconds
            });

            // Auto-remove failed job after 10 seconds
            setTimeout(() => {
              console.log(`[VideoQueue] Auto-removing failed job ${job.job_id}`);
              setQueue((prev) => prev.filter((j) => j.job_id !== job.job_id));
              toast.info('Failed job removed from queue', { duration: 3000 });
            }, 10000); // 10 seconds delay
          }
        } catch (error) {
          console.error(`Error polling job ${job.job_id}:`, error);
        }
      }
    };

    // Initial poll
    pollJobs();

    // Set up interval - only restart if active job IDs changed
    intervalRef.current = setInterval(pollJobs, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeJobIds, updateJobStatus]); // Only restart when active job IDs change

  // Get jobs by status
  const getJobsByStatus = useCallback(
    (status: VideoJobStatus['status']) => {
      return queue.filter((job) => job.status === status);
    },
    [queue]
  );

  // Get active jobs count
  const activeJobsCount = queue.filter(
    (job) => job.status === 'queued' || job.status === 'started'
  ).length;

  // Get completed jobs count
  const completedJobsCount = queue.filter((job) => job.status === 'finished').length;

  return {
    queue,
    activeJobsCount,
    completedJobsCount,
    isPolling,
    addJob,
    removeJob,
    clearCompleted,
    updateJobStatus,
    getJobsByStatus,
  };
}

