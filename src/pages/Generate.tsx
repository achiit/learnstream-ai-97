/**
 * Generate Page - Enhanced with Assessment and Video Queue
 * Complete flow: User Prompt → Assessment → Gemini Analysis → Manim Video Generation
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AssessmentDialog } from "@/components/AssessmentDialog";
import { VideoJobQueue } from "@/components/VideoJobQueue";
import { useVideoQueue, QueuedJob } from "@/hooks/useVideoQueue";
import { geminiService, AssessmentQuestion } from "@/services/gemini.service";
import { manimService } from "@/services/manim.service";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Sparkles, 
  Video, 
  Brain, 
  Zap,
  ArrowRight,
  Loader2,
  Play,
  X
} from "lucide-react";

const Generate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // State management
  const [userPrompt, setUserPrompt] = useState("");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [viewingJob, setViewingJob] = useState<QueuedJob | null>(null);
  
  // Video queue hook
  const {
    queue,
    activeJobsCount,
    completedJobsCount,
    addJob,
    removeJob,
    clearCompleted,
  } = useVideoQueue();

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  // Load prompt from URL if present
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam && !userPrompt) {
      setUserPrompt(promptParam);
    }
  }, [searchParams]);

  // Handle video ready event from queue
  useEffect(() => {
    const handleVideoReady = (event: CustomEvent) => {
      const job = queue.find(j => j.job_id === event.detail.jobId);
      if (job) {
        handleViewVideo(job);
      }
    };

    window.addEventListener('video-ready', handleVideoReady as EventListener);
    return () => window.removeEventListener('video-ready', handleVideoReady as EventListener);
  }, [queue]);

  // Step 1: Start Assessment
  const handleStartAssessment = async () => {
    if (!userPrompt.trim()) {
      toast.error('Please enter a topic to learn');
      return;
    }

    setIsGeneratingQuestions(true);
    setShowAssessment(true); // Show dialog with loading state

    try {
      const questions = await geminiService.generateAssessmentQuestions(userPrompt);
      setAssessmentQuestions(questions);
      // Dialog will automatically show questions once they're set
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate assessment questions');
      setShowAssessment(false);
      setAssessmentQuestions([]); // Clear any partial state
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Step 2: Handle Assessment Completion
  const handleAssessmentComplete = async (answers: number[]) => {
    setIsAnalyzing(true);

    try {
      // Analyze results with Gemini
      const analysis = await geminiService.analyzeAssessmentResults(
        userPrompt,
        assessmentQuestions,
        answers
      );

      // Close assessment dialog
      setShowAssessment(false);

      // Show analysis results
      toast.success('Assessment complete!', {
        description: `Level: ${analysis.complexityLevel}/5 • Reviews: ${analysis.reviewCount}`,
      });

      // Generate video with Manim API
      await generateVideo(analysis.enhancedPrompt, analysis.reviewCount);

    } catch (error) {
      console.error('Error analyzing assessment:', error);
      toast.error('Failed to analyze assessment');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 3: Generate Video
  const generateVideo = async (prompt: string, reviewCount: number) => {
    try {
      toast.info('Starting video generation...', {
        description: 'This may take 1-3 minutes',
      });

      const response = await manimService.generateVideo({
        prompt: prompt,
        enable_audio: true,
        review_cycles: reviewCount,
      });

      // Add to queue
      addJob(
        {
          job_id: response.job_id,
          status: response.status as any,
          progress: 'Queued',
          created_at: new Date().toISOString(),
          prompt: prompt,
        },
        userPrompt
      );

      // Clear the prompt for next use
      setUserPrompt("");

    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('Failed to start video generation');
    }
  };

  // View a completed video
  const handleViewVideo = (job: QueuedJob) => {
    setViewingJob(job);
    setCurrentVideoUrl(manimService.getVideoUrl(job.job_id));
  };

  // Close video viewer
  const handleCloseVideo = () => {
    setViewingJob(null);
    setCurrentVideoUrl(null);
  };

  // Retry a failed job
  const handleRetryJob = async (job: QueuedJob) => {
    try {
      toast.info('Retrying video generation...');
      
      // Remove the failed job from queue
      removeJob(job.job_id);
      
      // Start a new generation with the same prompt
      const response = await manimService.generateVideo({
        prompt: job.prompt,
        enable_audio: true,
        review_cycles: 3, // Default review count for retry
      });

      // Add new job to queue
      addJob(
        {
          job_id: response.job_id,
          status: response.status as any,
          progress: 'Queued',
          created_at: new Date().toISOString(),
          prompt: job.prompt,
        },
        job.userPrompt
      );

      toast.success('New video generation started!');
    } catch (error) {
      console.error('Error retrying video generation:', error);
      toast.error('Failed to retry video generation');
    }
  };

  return (
    <Layout showAuth>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
            </div>
            <h1 className="text-4xl font-bold">Generate Your Learning Video</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell us what you want to learn, and we'll create a personalized video 
              tailored to your knowledge level
            </p>
          </div>

          {/* Video Viewer */}
          {viewingJob && currentVideoUrl && (
            <Card className="overflow-hidden shadow-2xl">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={handleCloseVideo}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="aspect-video bg-black">
                  <video
                    src={currentVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{viewingJob.userPrompt}</h3>
                <p className="text-sm text-muted-foreground">{viewingJob.prompt}</p>
              </div>
            </Card>
          )}

          {/* Main Form */}
          <Card className="p-8 shadow-xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-base font-semibold">
                  What would you like to learn?
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Example: Explain the Pythagorean theorem..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="min-h-[120px] text-base resize-none"
                  disabled={isGeneratingQuestions || isAnalyzing}
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about the topic you want to understand
                </p>
              </div>

              <Button
                onClick={handleStartAssessment}
                disabled={!userPrompt.trim() || isGeneratingQuestions || isAnalyzing}
                className="w-full h-12 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isGeneratingQuestions || isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isGeneratingQuestions ? 'Preparing Assessment...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Assessment & Generate Video
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* How It Works */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  1
                </div>
                <h4 className="font-medium">Quick Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  Answer 3 questions to help us understand your current knowledge level
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  2
                </div>
                <h4 className="font-medium">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your responses to determine the perfect complexity level
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  3
                </div>
                <h4 className="font-medium">Video Generation</h4>
                <p className="text-sm text-muted-foreground">
                  Get a personalized animated video in 1-3 minutes
                </p>
              </div>
            </div>
          </Card>

          {/* Queue Status */}
          {queue.length > 0 && (
            <Card className="p-6 border-primary/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Video Generation Queue</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeJobsCount > 0 ? (
                        <>{activeJobsCount} generating • {completedJobsCount} ready</>
                      ) : (
                        <>{completedJobsCount} videos ready to view</>
                      )}
                    </p>
                  </div>
                </div>
                {activeJobsCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Assessment Dialog */}
      <AssessmentDialog
        open={showAssessment}
        onOpenChange={setShowAssessment}
        questions={assessmentQuestions}
        loading={isGeneratingQuestions}
        onComplete={handleAssessmentComplete}
        userPrompt={userPrompt}
      />

      {/* Floating Video Queue */}
      <VideoJobQueue
        queue={queue}
        onRemoveJob={removeJob}
        onClearCompleted={clearCompleted}
        onViewVideo={handleViewVideo}
        onRetryJob={handleRetryJob}
      />
    </Layout>
  );
};

export default Generate;
