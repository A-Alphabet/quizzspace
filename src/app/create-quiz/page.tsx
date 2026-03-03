'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Alert } from '@/components/ui';
import { TOTPModal } from '@/components/TOTPModal';

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

interface ExistingQuiz {
  id: string;
  title: string;
  createdAt: string;
  questions: Question[];
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [existingQuizzes, setExistingQuizzes] = useState<ExistingQuiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [quiz, setQuiz] = useState<QuizForm>({
    title: '',
    questions: [],
  });
  const [currentStep, setCurrentStep] = useState<'title' | 'questions'>('title');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing quizzes when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchQuizzes = async () => {
      setIsLoadingQuizzes(true);
      try {
        const response = await fetch('/api/quiz');
        if (response.ok) {
          const data = await response.json();
          setExistingQuizzes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
      } finally {
        setIsLoadingQuizzes(false);
      }
    };

    fetchQuizzes();
  }, [isAuthenticated]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const response = await fetch(`/api/quiz/${quizId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExistingQuizzes(existingQuizzes.filter((q) => q.id !== quizId));
      } else {
        setError('Failed to delete quiz');
      }
    } catch (err) {
      setError('Failed to delete quiz');
      console.error(err);
    }
  };

  const handleEditQuiz = (quiz: ExistingQuiz) => {
    setQuiz({
      title: quiz.title,
      questions: quiz.questions,
    });
    setShowCreateForm(true);
  };

  const handleHostQuiz = (quizId: string) => {
    router.push(`/host/${quizId}`);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-slate-900 dark:to-slate-800 p-4 animate-fade-in">
      {!isAuthenticated && (
        <TOTPModal onSuccess={() => setIsAuthenticated(true)} />
      )}

      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1 transition-colors duration-200 hover:gap-2"
        >
          ← Back to Home
        </button>

        <Card className="shadow-xl animate-scale-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Quiz
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Manage and host your quizzes</p>

          {error && (
            <Alert variant="error" className="mb-6 animate-slide-up">
              ❌ {error}
            </Alert>
          )}

          {isAuthenticated && !showCreateForm ? (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                  📚 Your Quizzes
                </h2>

                {isLoadingQuizzes ? (
                  <div className="flex items-center justify-center gap-3 p-8">
                    <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin-slow"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading quizzes...</p>
                  </div>
                ) : existingQuizzes.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400 mb-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    No quizzes created yet. Create your first one!
                  </p>
                ) : (
                  <div className="space-y-3 mb-6">
                    {existingQuizzes.map((q, idx) => (
                      <div
                        key={q.id}
                        className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 hover:shadow-lg transition-all duration-300 opacity-0 animate-[slideUp_0.3s_ease-out_forwards]"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {q.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {q.questions.length} questions • Created{' '}
                            {new Date(q.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleHostQuiz(q.id)}
                            className="whitespace-nowrap"
                          >
                            🎮 Host
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditQuiz(q)}
                            className="whitespace-nowrap"
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuiz(q.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 whitespace-nowrap"
                          >
                            🗑️ Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full animate-slide-up"
                  onClick={() => {
                    setShowCreateForm(true);
                    setQuiz({ title: '', questions: [] });
                    setCurrentStep('title');
                  }}
                >
                  ✨ + Create New Quiz
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {currentStep === 'title' && (
                <div className="space-y-6 animate-slide-up">
                  <Input
                    label="Quiz Title"
                    placeholder="e.g., US Presidents Quiz"
                    value={quiz.title}
                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                    aria-label="Quiz title"
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => {
                        setShowCreateForm(false);
                        setQuiz({ title: '', questions: [] });
                      }}
                    >
                      ← Back
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
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
                      Continue to Questions →
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 'questions' && (
                <div className="space-y-6 animate-slide-up">
                  <div>
                    <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
                      📝 Questions (<span className="text-blue-600 dark:text-blue-400">{quiz.questions.length}</span>/10)
                    </h2>

                    {quiz.questions.map((question, qIdx) => (
                      <div
                        key={question.id}
                        className="mb-8 p-5 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 border-l-4 border-blue-500 hover:shadow-md transition-all duration-300 opacity-0 animate-[slideUp_0.4s_ease-out_forwards]"
                        style={{ animationDelay: `${qIdx * 50}ms` }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                            Question {qIdx + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveQuestion(question.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-bold transition-colors duration-200"
                            aria-label={`Delete question ${qIdx + 1}`}
                          >
                            🗑️ Delete
                          </button>
                        </div>

                        <Input
                          label="Question Text"
                          placeholder="Enter your question"
                          value={question.text}
                          onChange={(e) =>
                            handleUpdateQuestion(question.id, { text: e.target.value })
                          }
                          className="mb-4"
                        />

                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2 text-slate-900 dark:text-white">
                            ⏱️ Time Limit (seconds)
                          </label>
                          <select
                            value={question.timerSeconds}
                            onChange={(e) =>
                              handleUpdateQuestion(question.id, {
                                timerSeconds: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-slate-500 rounded-lg dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-gray-400"
                          >
                            {[5, 10, 15, 20, 25, 30].map((t) => (
                              <option key={t} value={t}>
                                {t} seconds
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">✅ Answer Choices</p>
                          {question.choices.map((choice, cIdx) => (
                            <div key={choice.id} className="flex gap-3 items-start">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={choice.isCorrect}
                                onChange={() =>
                                  handleSetCorrectChoice(question.id, choice.id)
                                }
                                className="w-5 h-5 mt-2.5 cursor-pointer accent-green-600"
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
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {quiz.questions.length < 10 && (
                    <Button
                      variant="outline"
                      className="w-full mb-6 animate-slide-up"
                      onClick={handleAddQuestion}
                    >
                      ➕ Add Question
                    </Button>
                  )}

                  {quiz.questions.length >= 3 && (
                    <div className="flex gap-3 animate-slide-up">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={() => {
                          setCurrentStep('title');
                        }}
                      >
                        ← Back
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        isLoading={isLoading}
                        onClick={validateAndSubmit}
                      >
                        🚀 Create Quiz
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
