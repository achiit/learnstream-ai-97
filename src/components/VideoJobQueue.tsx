/**
 * Video Job Queue Component
 * Displays video generation jobs in a floating queue panel
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  Eye,
} from 'lucide-react';
import { QueuedJob } from '@/hooks/useVideoQueue';
import { format } from 'date-fns';
import { manimService } from '@/services/manim.service';
import { toast } from 'sonner';

interface VideoJobQueueProps {
  queue: QueuedJob[];
  onRemoveJob: (jobId: string) => void;
  onClearCompleted: () => void;
  onViewVideo?: (job: QueuedJob) => void;
  onRetryJob?: (job: QueuedJob) => void;
}

export function VideoJobQueue({
  queue,
  onRemoveJob,
  onClearCompleted,
  onViewVideo,
  onRetryJob,
}: VideoJobQueueProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [downloadingJobs, setDownloadingJobs] = useState<Set<string>>(new Set());

  if (queue.length === 0) {
    return null;
  }

  const activeJobs = queue.filter(
    (job) => job.status === 'queued' || job.status === 'started'
  );
  const completedJobs = queue.filter((job) => job.status === 'finished');
  const failedJobs = queue.filter((job) => job.status === 'failed');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
      case 'started':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'finished':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      queued: 'secondary',
      started: 'default',
      finished: 'outline',
      failed: 'destructive',
    };

    const labels: Record<string, string> = {
      queued: 'Queued',
      started: 'Processing',
      finished: 'Ready',
      failed: 'Failed',
    };

    return (
      <Badge variant={variants[status]} className="text-xs capitalize">
        {labels[status] || status}
      </Badge>
    );
  };

  const handleDownload = async (job: QueuedJob) => {
    if (downloadingJobs.has(job.job_id)) return;

    setDownloadingJobs(prev => new Set(prev).add(job.job_id));
    
    try {
      const videoUrl = await manimService.downloadVideo(job.job_id);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `video_${job.job_id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error('Failed to download video');
    } finally {
      setDownloadingJobs(prev => {
        const next = new Set(prev);
        next.delete(job.job_id);
        return next;
      });
    }
  };

  const handleView = (job: QueuedJob) => {
    if (onViewVideo) {
      onViewVideo(job);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-2">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              {activeJobs.length > 0 ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">Video Generation Queue</h3>
              <p className="text-xs text-muted-foreground">
                {activeJobs.length} active • {completedJobs.length} completed
                {failedJobs.length > 0 && <> • <span className="text-red-500">{failedJobs.length} failed</span></>}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Job List */}
        {isExpanded && (
          <div>
            <ScrollArea className="max-h-[400px]">
              <div className="p-2 space-y-2">
                {queue.map((job) => {
                  // Force component update by logging
                  console.log(`[VideoJobQueue] Rendering job ${job.job_id.substring(0, 8)}: status=${job.status}`);
                  
                  return (
                  <Card key={`${job.job_id}-${job.status}`} className="p-3">
                    <div className="space-y-2">
                      {/* Job Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {getStatusIcon(job.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {job.userPrompt}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(job.addedAt, 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>

                      {/* Progress */}
                      {(job.status === 'queued' || job.status === 'started') && (
                        <div className="space-y-1">
                          <Progress value={job.status === 'queued' ? 10 : 50} className="h-1" />
                          <p className="text-xs text-muted-foreground">{job.progress}</p>
                        </div>
                      )}

                      {/* Error Message */}
                      {job.status === 'failed' && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-2">
                          <p className="text-xs font-medium text-red-600 mb-1">Generation Failed</p>
                          {job.error && (
                            <p className="text-xs text-red-500">
                              {job.error.replace(/\[bold red\]/g, '').replace(/\[\/bold red\]/g, '')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {job.status === 'finished' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => handleView(job)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => handleDownload(job)}
                              disabled={downloadingJobs.has(job.job_id)}
                            >
                              {downloadingJobs.has(job.job_id) ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3 mr-1" />
                              )}
                              Download
                            </Button>
                          </>
                        )}
                        {job.status === 'failed' && onRetryJob && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => onRetryJob(job)}
                          >
                            <Loader2 className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        )}
                        {(job.status === 'finished' || job.status === 'failed') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive hover:text-destructive ml-auto"
                            onClick={() => onRemoveJob(job.job_id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            {(completedJobs.length > 0 || failedJobs.length > 0) && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={onClearCompleted}
                >
                  Clear Completed ({completedJobs.length + failedJobs.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

