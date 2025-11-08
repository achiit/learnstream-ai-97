import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, History, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    // Placeholder for file upload - will connect to your backend
    toast.info("Upload feature will connect to your backend API");
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate("/level-check");
    }, 1000);
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a topic or question");
      return;
    }

    setLoading(true);
    // Placeholder for prompt submission - will connect to your backend
    toast.info("Prompt feature will connect to your backend API");
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate("/level-check");
    }, 1000);
  };

  if (!user) return null;

  return (
    <Layout showAuth>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Let's create your next learning video.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-warm">
                  <Upload className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Upload Textbook</h2>
                  <p className="text-sm text-muted-foreground">Upload pages from your textbook</p>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-1">Click to upload</p>
                  <p className="text-sm text-muted-foreground">PDF or images accepted</p>
                </label>
              </div>
            </Card>

            {/* Custom Prompt Section */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-accent">
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Custom Topic</h2>
                  <p className="text-sm text-muted-foreground">Describe what you want to learn</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Enter your topic or question</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., Explain photosynthesis in plants..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button 
                  onClick={handlePromptSubmit}
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-gradient-accent"
                >
                  {loading ? "Processing..." : "Generate Video"}
                </Button>
              </div>
            </Card>
          </div>

          {/* History Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-secondary">
                <History className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Learning History</h2>
                <p className="text-sm text-muted-foreground">Your previous uploads and generated videos</p>
              </div>
            </div>
            
            <div className="text-center py-12 text-muted-foreground">
              <p>No videos yet. Upload your first textbook or enter a topic to start learning!</p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
