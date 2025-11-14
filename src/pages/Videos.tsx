/**
 * Videos Page - Display all generated videos
 * Shows videos with audio and without audio in separate sections
 */

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { manimService, VideoInfo } from "@/services/manim.service";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Video, 
  Volume2, 
  VolumeX, 
  Download, 
  Play,
  Loader2,
  RefreshCw,
  Calendar,
  HardDrive
} from "lucide-react";
import { format } from "date-fns";

const Videos = () => {
  const navigate = useNavigate();
  const [videosWithAudio, setVideosWithAudio] = useState<VideoInfo[]>([]);
  const [videosWithoutAudio, setVideosWithoutAudio] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [downloadingVideo, setDownloadingVideo] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const [withAudio, withoutAudio] = await Promise.all([
        manimService.getVideosWithAudio(),
        manimService.getVideosWithoutAudio(),
      ]);
      setVideosWithAudio(withAudio.videos);
      setVideosWithoutAudio(withoutAudio.videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDownload = async (video: VideoInfo) => {
    if (downloadingVideo === video.id) return;

    setDownloadingVideo(video.id);
    try {
      const baseUrl = import.meta.env.VITE_MANIM_API_URL || 'http://localhost:5002';
      const downloadUrl = video.download_url.startsWith('http')
        ? video.download_url
        : `${baseUrl}${video.download_url}`;
      const response = await fetch(downloadUrl, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          "x-requested-with": "XMLHttpRequest",
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download video');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = video.filename || `video_${video.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error('Failed to download video');
    } finally {
      setDownloadingVideo(null);
    }
  };

  const handlePlay = (video: VideoInfo) => {
    setPlayingVideo(video.id);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'MMM d, yyyy h:mm a');
  };

  const VideoCard = ({ video }: { video: VideoInfo }) => {
    const isPlaying = playingVideo === video.id;
    const baseUrl = import.meta.env.VITE_MANIM_API_URL || 'http://localhost:5002';
    const streamUrl = video.video_url.startsWith('http') 
      ? video.video_url 
      : `${baseUrl}${video.video_url}`;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-video bg-black">
          {isPlaying ? (
            <video
              src={streamUrl}
              controls
              autoPlay
              className="w-full h-full"
              onEnded={() => setPlayingVideo(null)}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/20"
                onClick={() => handlePlay(video)}
              >
                <Play className="h-8 w-8 mr-2" />
                Play Video
              </Button>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{video.filename}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {formatDate(video.created_at)}
              </p>
            </div>
            <Badge variant={video.has_audio ? "default" : "secondary"}>
              {video.has_audio ? (
                <Volume2 className="h-3 w-3 mr-1" />
              ) : (
                <VolumeX className="h-3 w-3 mr-1" />
              )}
              {video.has_audio ? "With Audio" : "No Audio"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {video.size_mb.toFixed(2)} MB
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload(video)}
              disabled={downloadingVideo === video.id}
            >
              {downloadingVideo === video.id ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              Download
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Layout showAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Generated Videos</h1>
              <p className="text-muted-foreground mt-1">
                Browse all your generated learning videos
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchVideos}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Videos with Audio */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Volume2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Videos with Audio</h2>
                    <p className="text-sm text-muted-foreground">
                      {videosWithAudio.length} video{videosWithAudio.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>

                {videosWithAudio.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Volume2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No videos with audio yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/generate')}
                    >
                      Generate Your First Video
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videosWithAudio.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </div>

              {/* Videos without Audio */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <VolumeX className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Videos without Audio</h2>
                    <p className="text-sm text-muted-foreground">
                      {videosWithoutAudio.length} video{videosWithoutAudio.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>

                {videosWithoutAudio.length === 0 ? (
                  <Card className="p-12 text-center">
                    <VolumeX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No videos without audio yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/generate')}
                    >
                      Generate Your First Video
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videosWithoutAudio.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Videos;

