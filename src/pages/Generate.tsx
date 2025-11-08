import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, Share2, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Generate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    // Simulate video generation
    const timer = setTimeout(() => {
      // Placeholder video URL - will be replaced with your backend response
      setVideoUrl("https://example.com/video.mp4");
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout showAuth>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {loading ? (
            <Card className="p-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Creating Your Custom Video</h2>
                <p className="text-muted-foreground">
                  Our AI is generating a personalized explainer video just for you...
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Your Learning Video</h1>
                  <p className="text-muted-foreground">
                    Personalized to your learning level
                  </p>
                </div>
                <Button onClick={() => navigate("/dashboard")} variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </div>

              <Card className="overflow-hidden shadow-large">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {/* Placeholder for video player - will be replaced with actual video */}
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center mx-auto">
                      <svg
                        className="w-8 h-8 text-primary-foreground"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">
                      Video player will display here with content from your backend
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Introduction to Your Topic
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Level: Intermediate • Duration: 5:23
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-gradient-warm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-soft">
                <h3 className="font-semibold mb-4">What's Next?</h3>
                <div className="space-y-3 text-sm">
                  <p className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Review the video and take notes on key concepts</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Upload another topic or refine your current one</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Track your learning progress in the dashboard</span>
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Generate;
