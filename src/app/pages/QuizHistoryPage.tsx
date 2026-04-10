import { motion, AnimatePresence } from 'motion/react';
import { History, RotateCcw, FileText, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '../../services/api';

interface GeneratedQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface StoredQuiz {
  _id?: string;
  id?: string;
  subject?: string;
  topic?: string;
  gradeClass?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  generationMode?: 'standard' | 'spaced-repetition';
  repetitionLevel?: number;
  numberOfQuestions?: number;
  questions?: any[];
  createdAt?: string;
}

interface AttemptSummary {
  _id?: string;
  id?: string;
  quizId?: {
    _id?: string;
    id?: string;
    subject?: string;
    topic?: string;
  };
  percentageScore?: number;
  completedAt?: string;
  createdAt?: string;
}

const REATTEMPT_STORAGE_KEY = 'quizpulse_reattempt_quiz';

export default function QuizHistoryPage() {
  const navigate = useNavigate();
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [savedQuizzes, setSavedQuizzes] = useState<StoredQuiz[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<AttemptSummary[]>([]);
  const [selectedSolutionQuiz, setSelectedSolutionQuiz] = useState<StoredQuiz | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError('');

        const [quizResponse, progressResponse] = await Promise.all([
          apiClient.getMyQuizzes(),
          apiClient.getUserProgress(),
        ]);

        const quizzes = Array.isArray(quizResponse?.data?.quizzes) ? quizResponse.data.quizzes : [];
        const attempts = Array.isArray(progressResponse?.data?.attempts) ? progressResponse.data.attempts : [];

        setSavedQuizzes(quizzes);
        setRecentAttempts(
          attempts
            .slice()
            .sort((a: AttemptSummary, b: AttemptSummary) => {
              const aTime = new Date(a.completedAt || a.createdAt || 0).getTime();
              const bTime = new Date(b.completedAt || b.createdAt || 0).getTime();
              return bTime - aTime;
            })
            .slice(0, 10)
        );
      } catch (error: any) {
        setHistoryError(error?.message || 'Failed to load quiz history');
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, []);

  const latestAttemptByQuiz = useMemo(() => {
    const map = new Map<string, AttemptSummary>();
    recentAttempts.forEach((attempt) => {
      const quizId = String(attempt?.quizId?._id || attempt?.quizId?.id || '');
      if (!quizId || map.has(quizId)) {
        return;
      }
      map.set(quizId, attempt);
    });
    return map;
  }, [recentAttempts]);

  const formatDate = (value?: string) => {
    if (!value) {
      return 'Recently';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Recently';
    }
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const mapStoredQuizToQuestions = (quiz: StoredQuiz): GeneratedQuestion[] => {
    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    return questions.map((q: any, index: number) => ({
      id: String(q?._id || q?.id || `${quiz._id || quiz.id}-q-${index}`),
      type: q?.type,
      question: q?.question,
      options: q?.options,
      correctAnswer: q?.correctAnswer,
      explanation: q?.explanation || 'AI explanation is not available for this question yet.',
    }));
  };

  const handleReattemptQuiz = (quiz: StoredQuiz) => {
    const questions = mapStoredQuizToQuestions(quiz);
    if (!questions.length) {
      setHistoryError('This saved quiz has no questions available for reattempt.');
      return;
    }

    sessionStorage.setItem(REATTEMPT_STORAGE_KEY, JSON.stringify(quiz));
    navigate('/quiz-generator');
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold mb-2">Quiz History</h1>
        <p className="text-muted-foreground">
          Track your previous quizzes, reattempt any quiz, and review AI-generated solutions.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border border-border rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Saved Quizzes</h2>
        </div>

        {historyLoading ? (
          <div className="h-24 rounded-lg bg-accent/30 flex items-center justify-center text-sm text-muted-foreground">
            Loading your quiz history...
          </div>
        ) : historyError ? (
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
            {historyError}
          </div>
        ) : savedQuizzes.length === 0 ? (
          <div className="rounded-lg border border-border bg-accent/20 p-4 text-sm text-muted-foreground">
            No saved quizzes yet. Generate your first quiz and it will appear here.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {savedQuizzes.map((quiz) => {
              const quizId = String(quiz._id || quiz.id || '');
              const latestAttempt = latestAttemptByQuiz.get(quizId);

              return (
                <div key={quizId} className="rounded-lg border border-border p-4 bg-accent/10">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-base">
                        {quiz.subject || 'Subject'} - {quiz.topic || 'Topic'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Grade: {quiz.gradeClass || 'N/A'} | Difficulty: {quiz.difficulty || 'medium'} | Questions: {quiz.numberOfQuestions || quiz.questions?.length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mode: {quiz.generationMode === 'spaced-repetition' ? `Spaced repetition${quiz.repetitionLevel ? ` · Round ${quiz.repetitionLevel}` : ''}` : 'Standard practice'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {formatDate(quiz.createdAt)}
                      </p>
                      {latestAttempt ? (
                        <p className="text-xs mt-2 text-primary font-medium">
                          Latest score: {Number(latestAttempt.percentageScore || 0).toFixed(1)}% ({formatDate(latestAttempt.completedAt || latestAttempt.createdAt)})
                        </p>
                      ) : (
                        <p className="text-xs mt-2 text-muted-foreground">No attempt yet</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReattemptQuiz(quiz)}
                        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reattempt
                      </button>
                      <button
                        onClick={() => setSelectedSolutionQuiz(quiz)}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-accent flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        AI Solutions
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {recentAttempts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-background border border-border rounded-xl p-6"
        >
          <p className="text-lg font-semibold mb-3">Recent Attempts</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Quiz</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt, index) => (
                  <tr key={String(attempt._id || attempt.id || index)} className="border-b border-border/60">
                    <td className="py-2 pr-4">
                      {(attempt.quizId?.subject || 'Subject')} - {(attempt.quizId?.topic || 'Topic')}
                    </td>
                    <td className="py-2 pr-4 font-medium">{Number(attempt.percentageScore || 0).toFixed(1)}%</td>
                    <td className="py-2 text-muted-foreground">{formatDate(attempt.completedAt || attempt.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedSolutionQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 p-4 overflow-y-auto"
            onClick={() => setSelectedSolutionQuiz(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl mx-auto mt-8 mb-8 bg-background border border-border rounded-xl p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    AI Solutions: {selectedSolutionQuiz.subject || 'Subject'} - {selectedSolutionQuiz.topic || 'Topic'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Detailed answer keys and AI explanations for each question.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSolutionQuiz(null)}
                  className="w-9 h-9 rounded-lg border border-border bg-background hover:bg-accent flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {mapStoredQuizToQuestions(selectedSolutionQuiz).map((question, index) => (
                  <div key={question.id} className="rounded-lg border border-border p-4">
                    <p className="font-medium">Q{index + 1}. {question.question}</p>
                    {question.options?.length ? (
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {question.options.map((option, optionIndex) => (
                          <li key={`${question.id}-opt-${optionIndex}`}>- {option}</li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="text-sm mt-3">
                      <span className="font-semibold text-green-600">Correct Answer:</span> {question.correctAnswer}
                    </p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      <span className="font-semibold text-foreground">AI Explanation:</span> {question.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
