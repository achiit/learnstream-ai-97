/**
 * Gemini API Service
 * Handles question generation and complexity analysis for learning assessment
 */

export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-3)
}

export interface AssessmentResult {
  questions: AssessmentQuestion[];
  userAnswers: number[];
  complexityLevel: number; // 0-5
  enhancedPrompt: string; // Max 500 chars
  reviewCount: number; // 1-5
}

interface GeminiQuestionResponse {
  questions: AssessmentQuestion[];
}

interface GeminiAnalysisResponse {
  complexityLevel: number;
  enhancedPrompt: string;
  reviewCount: number;
  reasoning: string;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Set VITE_GEMINI_API_KEY in environment variables.');
    }
  }

  /**
   * Generate 3 assessment questions based on user's initial prompt
   */
  async generateAssessmentQuestions(userPrompt: string): Promise<AssessmentQuestion[]> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = `You are an educational assessment expert. Based on the user's learning request, generate exactly 3 multiple-choice questions to assess their current knowledge level.

Rules:
1. Generate exactly 3 questions
2. Each question must have exactly 4 options
3. Questions should range from basic to intermediate difficulty
4. Questions should relate to prerequisite knowledge for the topic
5. Return ONLY valid JSON without any markdown formatting or code blocks

User's request: "${userPrompt}"

Return format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}`;

    try {
      const response = await fetch(
        `${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: systemPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response from Gemini API');
      }

      // Clean the response - remove markdown code blocks if present
      const cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed: GeminiQuestionResponse = JSON.parse(cleanedText);
      
      // Validate and ensure we have exactly 3 questions
      if (!parsed.questions || parsed.questions.length !== 3) {
        throw new Error('Invalid number of questions generated');
      }

      return parsed.questions;
    } catch (error) {
      console.error('Error generating assessment questions:', error);
      // Return fallback questions
      return this.getFallbackQuestions(userPrompt);
    }
  }

  /**
   * Analyze user's assessment responses and generate enhanced prompt
   */
  async analyzeAssessmentResults(
    userPrompt: string,
    questions: AssessmentQuestion[],
    userAnswers: number[]
  ): Promise<Omit<AssessmentResult, 'questions' | 'userAnswers'>> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Calculate correctness
    const correctCount = questions.reduce((count, q, idx) => {
      return count + (q.correctAnswer === userAnswers[idx] ? 1 : 0);
    }, 0);

    const questionsWithAnswers = questions.map((q, idx) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswers[idx],
      isCorrect: q.correctAnswer === userAnswers[idx]
    }));

    const analysisPrompt = `You are an educational content analyzer. Analyze the user's assessment results and create an optimized learning prompt.

Original User Request: "${userPrompt}"

Assessment Results:
${JSON.stringify(questionsWithAnswers, null, 2)}

Correct Answers: ${correctCount}/3

Based on this assessment:
1. Determine complexity level (0-5):
   - 0: User has no knowledge (3/3 wrong)
   - 1-2: Beginner (1/3 correct)
   - 3: Intermediate (2/3 correct)
   - 4-5: Advanced (3/3 correct)

2. Create an enhanced prompt (max 500 characters) that:
   - Adjusts explanation depth based on user's level
   - Focuses on gaps in knowledge
   - Optimizes for Manim video generation

3. Determine review cycles (1-5):
   - Lower knowledge = more reviews (3-5 cycles)
   - Higher knowledge = fewer reviews (1-2 cycles)

Return ONLY valid JSON without any markdown formatting:
{
  "complexityLevel": 0-5,
  "enhancedPrompt": "max 500 chars",
  "reviewCount": 1-5,
  "reasoning": "brief explanation"
}`;

    try {
      const response = await fetch(
        `${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: analysisPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 1024,
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response from Gemini API');
      }

      // Clean the response
      const cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const analysis: GeminiAnalysisResponse = JSON.parse(cleanedText);
      
      // Ensure prompt is within 500 chars
      const enhancedPrompt = analysis.enhancedPrompt.slice(0, 500);
      
      // Ensure review count is between 1-5
      const reviewCount = Math.max(1, Math.min(5, analysis.reviewCount));
      
      // Ensure complexity level is between 0-5
      const complexityLevel = Math.max(0, Math.min(5, analysis.complexityLevel));

      return {
        complexityLevel,
        enhancedPrompt,
        reviewCount
      };
    } catch (error) {
      console.error('Error analyzing assessment results:', error);
      // Return fallback analysis based on correct count
      return this.getFallbackAnalysis(userPrompt, correctCount);
    }
  }

  /**
   * Fallback questions in case API fails
   */
  private getFallbackQuestions(userPrompt: string): AssessmentQuestion[] {
    return [
      {
        question: "How would you rate your familiarity with this topic?",
        options: [
          "Never heard of it",
          "Heard of it but don't understand",
          "Basic understanding",
          "Good understanding"
        ],
        correctAnswer: 2
      },
      {
        question: "What is your preferred learning style?",
        options: [
          "Visual (diagrams, videos)",
          "Reading (text, articles)",
          "Hands-on (practice)",
          "Discussion (talking through)"
        ],
        correctAnswer: 0
      },
      {
        question: "How deep would you like the explanation to be?",
        options: [
          "Very basic - ELI5",
          "Introductory level",
          "Detailed explanation",
          "Advanced with examples"
        ],
        correctAnswer: 1
      }
    ];
  }

  /**
   * Fallback analysis in case API fails
   */
  private getFallbackAnalysis(
    userPrompt: string,
    correctCount: number
  ): Omit<AssessmentResult, 'questions' | 'userAnswers'> {
    const complexityMap: Record<number, number> = {
      0: 0,  // All wrong
      1: 2,  // 1 correct
      2: 3,  // 2 correct
      3: 4   // All correct
    };

    const reviewCountMap: Record<number, number> = {
      0: 5,  // All wrong - more reviews
      1: 4,
      2: 3,
      3: 2   // All correct - fewer reviews
    };

    const complexityLevel = complexityMap[correctCount];
    const reviewCount = reviewCountMap[correctCount];

    // Create a simple enhanced prompt
    const levelDescriptions = [
      'from absolute basics',
      'starting with fundamentals',
      'with clear explanations',
      'with detailed examples',
      'with advanced concepts'
    ];

    const enhancedPrompt = `Explain ${userPrompt} ${levelDescriptions[complexityLevel]} using clear visual animations. Focus on step-by-step understanding.`.slice(0, 500);

    return {
      complexityLevel,
      enhancedPrompt,
      reviewCount
    };
  }
}

export const geminiService = new GeminiService();

