/**
 * Assessment Dialog Component
 * Displays multiple choice questions to assess user's knowledge level
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { AssessmentQuestion } from '@/services/gemini.service';

interface AssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: AssessmentQuestion[];
  loading?: boolean;
  onComplete: (answers: number[]) => void;
  userPrompt: string;
}

export function AssessmentDialog({
  open,
  onOpenChange,
  questions,
  loading = false,
  onComplete,
  userPrompt,
}: AssessmentDialogProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleNext = () => {
    if (selectedOption !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = selectedOption;
      setAnswers(newAnswers);

      if (isLastQuestion) {
        // Complete the assessment
        onComplete(newAnswers as number[]);
      } else {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(answers[currentQuestionIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(answers[currentQuestionIndex - 1]);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  if (loading || questions.length === 0 || !currentQuestion) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Preparing Your Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Creating personalized questions to understand your level...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Quick Knowledge Check</DialogTitle>
          <DialogDescription className="text-base">
            Help us understand your level: <span className="font-medium text-foreground">"{userPrompt}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Indicators */}
          <div className="flex justify-center gap-2">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className="flex items-center"
              >
                {answers[idx] !== null ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : idx === currentQuestionIndex ? (
                  <Circle className="h-5 w-5 text-primary fill-primary/20" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>

          {/* Question Card */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
            <h3 className="text-lg font-semibold mb-4">
              {currentQuestion.question}
            </h3>

            <RadioGroup
              value={selectedOption?.toString()}
              onValueChange={(value) => handleOptionSelect(parseInt(value))}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedOption === idx
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                    onClick={() => handleOptionSelect(idx)}
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                    <Label
                      htmlFor={`option-${idx}`}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
              className="w-32"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="w-32"
            >
              {isLastQuestion ? 'Complete' : 'Next'}
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground">
            These questions help us create a video perfectly matched to your knowledge level
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

