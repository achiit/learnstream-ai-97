import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, MessageSquare, History, FileText, Trash2, Clock, Send, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useLearningSession } from "@/hooks/useLearningSession";
import { toast } from "sonner";
import { format } from "date-fns";
import { db } from "@/lib/database";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useUser();
  const { sessions, loading: sessionsLoading, createSession, deleteSession } = useLearningSession();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [interactionMessage, setInteractionMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', message: string}[]>([]);

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a topic or question");
      return;
    }

    // Redirect to the new Generate page with video generation flow
    navigate(`/generate?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleInteractionSend = async () => {
    if (!interactionMessage.trim() || !user) return;

    const userMessage = interactionMessage;
    setInteractionMessage("");

    // Add user message to chat
    setChatHistory([...chatHistory, { role: 'user', message: userMessage }]);
    
    // Save user message to database
    try {
      await db.chat.createMessage({
        user_id: user.id,
        role: 'user',
        message: userMessage,
      });
      console.log('User message saved to database');
    } catch (error) {
      console.error('Error saving user message:', error);
      // Don't block the UI if DB save fails
    }

    // Simulate AI response
    setTimeout(async () => {
      const aiResponse = "I'm here to help you learn! This is a demo response. Ask me anything about your learning topics.";
      
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        message: aiResponse
      }]);

      // Save AI response to database
      try {
        await db.chat.createMessage({
          user_id: user.id,
          role: 'ai',
          message: aiResponse,
        });
        console.log('AI message saved to database');
      } catch (error) {
        console.error('Error saving AI message:', error);
      }
    }, 1000);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session?')) {
      await deleteSession(sessionId);
    }
  };

  if (!user) return null;

  return (
    <Layout showAuth>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! Let's start learning.
            </p>
          </div>

          {/* Tabbed Interface */}
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Generate Video
              </TabsTrigger>
              <TabsTrigger value="interaction" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Live Interaction
              </TabsTrigger>
            </TabsList>

            {/* Generate Video Tab */}
            <TabsContent value="generate" className="mt-6">
              <Card className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF8B6D] to-[#FFB29E]">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-2xl">Generate Learning Video</h2>
                    <p className="text-muted-foreground">Describe what you want to learn and we'll create a personalized video</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-base font-medium">
                      What would you like to learn about?
                    </Label>
                    <Textarea
                      id="prompt"
                      placeholder="e.g., Explain photosynthesis in plants, How do black holes work, What is calculus..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={6}
                      className="resize-none text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Be specific about what you want to learn. The more detail you provide, the better the video!
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handlePromptSubmit}
                    disabled={loading || !prompt.trim()}
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#FF8B6D] to-[#FFB29E] hover:opacity-90 text-lg py-6"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-5 w-5" />
                        Generate Video
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Live Interaction Tab */}
            <TabsContent value="interaction" className="mt-6">
              <Card className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-2xl">Live Learning Interaction</h2>
                    <p className="text-muted-foreground">Chat with our AI tutor for instant answers and explanations</p>
                  </div>
                </div>

                {/* Open Live Interaction Button */}
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="text-center space-y-2">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg">Start Live Interaction</h3>
                    <p className="text-muted-foreground max-w-md">
                      Click the button below to open the live interaction interface in a new tab.
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.open('http://localhost:7860', '_blank')}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-lg px-8 py-6"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Open Live Interaction
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

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
            
            {sessionsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No sessions yet. Upload your first textbook or enter a topic to start learning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        session.source_type === 'upload' 
                          ? 'bg-gradient-warm' 
                          : 'bg-gradient-accent'
                      }`}>
                        {session.source_type === 'upload' ? (
                          <FileText className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-accent-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{session.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(session.created_at), 'MMM d, yyyy')}</span>
                          <span className="mx-1">•</span>
                          <span className={`capitalize ${
                            session.status === 'completed' ? 'text-green-600' :
                            session.status === 'failed' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
