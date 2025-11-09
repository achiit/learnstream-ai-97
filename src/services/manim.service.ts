/**
 * Manim Video API Service
 * Handles communication with the Manim video generation backend
 */

export interface VideoGenerationRequest {
  prompt: string;
  enable_audio?: boolean;
  review_cycles?: number;
}

export interface VideoJobStatus {
  job_id: string;
  status: 'queued' | 'started' | 'finished' | 'failed';
  progress: string;
  created_at: string;
  prompt: string;
  video_path?: string;
  error?: string;
}

export interface VideoGenerationResponse {
  job_id: string;
  status: string;
  message: string;
  status_url: string;
  video_url: string;
}

export interface JobListResponse {
  jobs: VideoJobStatus[];
  count: number;
}

class ManimService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_MANIM_API_URL || 'http://localhost:5002';
  }

  /**
   * Get headers with ngrok bypass
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
  }

  /**
   * Check if Manim API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('Manim API health check failed:', error);
      return false;
    }
  }

  /**
   * Generate a new video
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/generate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  }

  /**
   * Check job status
   */
  async getJobStatus(jobId: string): Promise<VideoJobStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/status/${jobId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[ManimService] Job ${jobId} status:`, data);
      return data;
    } catch (error) {
      console.error('Error getting job status:', error);
      throw error;
    }
  }

  /**
   * Download video (returns blob URL)
   */
  async downloadVideo(jobId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/video/${jobId}`, {
        headers: this.getHeaders(),
      });

      if (response.status === 202) {
        // Video not ready yet
        const data = await response.json();
        throw new Error(data.error || 'Video not ready yet');
      }

      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error downloading video:', error);
      throw error;
    }
  }

  /**
   * Get video URL for streaming/playing
   */
  getVideoUrl(jobId: string): string {
    return `${this.baseUrl}/api/v1/video/${jobId}`;
  }

  /**
   * List all jobs
   */
  async listJobs(): Promise<JobListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/jobs`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to list jobs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing jobs:', error);
      throw error;
    }
  }

  /**
   * Poll job status until completion
   * @param jobId Job ID to monitor
   * @param onProgress Callback for progress updates
   * @param pollInterval Interval in milliseconds (default: 5000)
   * @returns Final job status
   */
  async pollJobUntilComplete(
    jobId: string,
    onProgress?: (status: VideoJobStatus) => void,
    pollInterval: number = 5000
  ): Promise<VideoJobStatus> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getJobStatus(jobId);
          
          if (onProgress) {
            onProgress(status);
          }

          if (status.status === 'finished') {
            resolve(status);
            return;
          }

          if (status.status === 'failed') {
            reject(new Error(status.error || 'Video generation failed'));
            return;
          }

          // Continue polling
          setTimeout(poll, pollInterval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}

export const manimService = new ManimService();

