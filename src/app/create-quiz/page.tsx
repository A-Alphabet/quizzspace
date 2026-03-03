'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Alert } from '@/components/ui';

interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  timerSeconds: number;
  choices: Choice[];
}

interface QuizForm {
  title: string;
  questions: Question[];
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizForm>({
    title: '',
    questions: [],
  });
  const [currentStep, setCurrentStep] = useState<'title' | 'questions'>('title');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36),
      text: '',
      timerSeconds: 20,
      choices: [
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false },
      ],
    };

    if (quiz.questions.length < 10) {
      setQuiz({
        ...quiz,
        questions: [...quiz.questions, newQuestion],
      });
    } else {
      setError('Maximum 10 questions allowed');
    }
  };

  const handleRemoveQuestion = (id: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((q) => q.id !== id),
    });
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    });
  };

  const handleUpdateChoice = (
    questionId: string,
    choiceId: string,
    updates: Partial<Choice>
  ) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choices: q.choices.map((c) =>
                c.id === choiceId ? { ...c, ...updates } : c
              ),
            }
          : q
      ),
    });
  };

  const handleSetCorrectChoice = (questionId: string, correctChoiceId: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choices: q.choices.map((c) => ({
                ...c,
                isCorrect: c.id === correctChoiceId,
              })),
            }
          : q
      ),
    });
  };

  const validateAndSubmit = async () => {
    setError('');

    // Validation
    if (!quiz.title.trim()) {
      setError('Quiz title is required');
      return;
    }

    if (quiz.questions.length < 3) {
      setError('At least 3 questions are required');
      return;
    }

    if (quiz.questions.length > 10) {
      setError('Maximum 10 questions allowed');
      return;
    }

    // Validate each question
    for (const q of quiz.questions) {
      if (!q.text.trim()) {
        setError('All questions must have text');
        return;
      }

      for (const c of q.choices) {
        if (!c.text.trim()) {
          setError('All answer choices must have text');
          return;
        }
      }

      const correctCount = q.choices.filter((c) => c.isCorrect).length;
      if (correctCount !== 1) {
        setError('Each question must have exactly 1 correct answer');
        return;
      }
    }

    // Submit
    setIsLoading(true);
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quiz.title,
          questions: quiz.questions.map((q) => ({
            text: q.text,
            timerSeconds: q.timerSeconds,
            choices: q.choices.map((c) => ({
              text: c.text,
              isCorrect: c.isCorrect,
            })),
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create quiz');
      }

      const createdQuiz = await response.json();
      router.push(`/host/${createdQuiz.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create quiz. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1"
        >
          ← Back to Home
        </button>

        <Card className="shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
            Create Quiz
          </h1>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {currentStep === 'title' && (
            <div className="space-y-6">
              <Input
                label="Quiz Title"
                placeholder="e.g., US Presidents Quiz"
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                aria-label="Quiz title"
              />

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => {
                  if (quiz.title.trim()) {
                    setCurrentStep('questions');
                    if (quiz.questions.length === 0) {
                      handleAddQuestion();
                    }
                  } else {
                    setError('Please enter a quiz title');
                  }
                }}
              >
                Continue to Questions
              </Button>
            </div>
          )}

          {currentStep === 'questions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                  Questions ({quiz.questions.length}/10)
                </h2>

                {quiz.questions.map((question, qIdx) => (
                  <div
                    key={question.id}
                    className="mb-8 p-4 rounded-lg bg-slate-50 dark:bg-slate-700"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Question {qIdx + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        aria-label={`Delete question ${qIdx + 1}`}
                      >
                        Delete
                      </button>
                    </div>

                    <Input
                      label="Question Text"
                      placeholder="Enter your question"
                      value={question.text}
                      onChange={(e) =>
                        handleUpdateQuestion(question.id, { text: e.target.value })
                      }
                      className="mb-3"
                    />

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Time Limit (seconds)
                      </label>
                      <select
                        value={question.timerSeconds}
                        onChange={(e) =>
                          handleUpdateQuestion(question.id, {
                            timerSeconds: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                      >
                        {[5, 10, 15, 20, 25, 30].map((t) => (
                          <option key={t} value={t}>
                            {t} seconds
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Answer Choices</p>
                      {question.choices.map((choice, cIdx) => (
                        <div key={choice.id} className="flex gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={choice.isCorrect}
                            onChange={() =>
                              handleSetCorrectChoice(question.id, choice.id)
                            }
                            className="w-4 h-4 mt-1"
                            aria-label={`Mark choice ${cIdx + 1} as correct`}
                          />
                          <Input
                            placeholder={`Choice ${cIdx + 1}`}
                            value={choice.text}
                            onChange={(e) =>
                              handleUpdateChoice(question.id, choice.id, {
                                text: e.target.value,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {quiz.questions.length < 10 && (
                  <Button
                    variant="outline"
                    className="w-full mb-6"
                    onClick={handleAddQuestion}
                  >
                    + Add Question
                  </Button>
                )}

                {quiz.questions.length >= 3 && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                    onClick={validateAndSubmit}
                  >
                    Create Quiz
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
