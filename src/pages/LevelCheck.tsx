import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mock questions - will be fetched from your backend
const mockQuestions = [
  {
    id: 1,
    question: "What is your current understanding of this topic?",
    options: [
      "Complete beginner",
      "Some basic knowledge",
      "Intermediate understanding",
      "Advanced knowledge",
    ],
  },
  {
    id: 2,
    question: "How would you prefer to learn complex concepts?",
    options: [
      "Step by step with examples",
      "Visual diagrams and charts",
      "In-depth technical details",
      "Quick summary with key points",
    ],
  },
  {
    id: 3,
    question: "What's your learning goal?",
    options: [
      "Understand basic concepts",
      "Prepare for an exam",
      "Professional application",
      "Research and deep learning",
    ],
  },
];

const LevelCheck = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  const handleNext = () => {
    if (!selectedAnswer) {
      toast.error("Please select an answer");
      return;
    }

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer("");

    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers: string[]) => {
    setLoading(true);
    
    // Placeholder for quiz submission - will connect to your backend
    toast.info("Quiz results will be sent to your backend API");
    
    // Simulate API call and level determination
    setTimeout(() => {
      const level = "Intermediate"; // This will come from your backend
      toast.success(`Your level: ${level}`);
      navigate("/generate");
    }, 1000);
  };

  return (
    <Layout showAuth>
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-2xl p-8 shadow-large">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Level Check</h1>
              <p className="text-muted-foreground">
                Answer a few questions to help us personalize your learning experience
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestion + 1} of {mockQuestions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-6 py-6">
              <h2 className="text-xl font-semibold">
                {mockQuestions[currentQuestion].question}
              </h2>

              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="space-y-3">
                  {mockQuestions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-4">
              {currentQuestion > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentQuestion(currentQuestion - 1);
                    setSelectedAnswer(answers[currentQuestion - 1] || "");
                  }}
                  disabled={loading}
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!selectedAnswer || loading}
                className="ml-auto bg-gradient-warm"
              >
                {currentQuestion === mockQuestions.length - 1
                  ? loading
                    ? "Submitting..."
                    : "Submit"
                  : "Next"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default LevelCheck;
