import { motion } from 'motion/react';
import { Brain, Sparkles, Loader2, CheckCircle, BookOpen, Target, Zap, Plus, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  generationMode?: 'standard' | 'spaced-repetition';
  repetitionLevel?: number;
  questions?: any[];
}

export default function QuizGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [assessmentType, setAssessmentType] = useState<'formative' | 'summative' | 'diagnostic'>('formative');
  const [timeLimit, setTimeLimit] = useState(30);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [generationMode, setGenerationMode] = useState<'standard' | 'spaced-repetition'>('standard');
  const [repetitionLevel, setRepetitionLevel] = useState(0);
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: true,
    trueFalse: true,
    shortAnswer: false,
  });
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [quizId, setQuizId] = useState<string | null>(null);
  const [serverScore, setServerScore] = useState<number | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const REATTEMPT_STORAGE_KEY = 'quizpulse_reattempt_quiz';

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

  useEffect(() => {
    try {
      const rawQuiz = sessionStorage.getItem(REATTEMPT_STORAGE_KEY);
      if (!rawQuiz) {
        return;
      }

      const parsedQuiz = JSON.parse(rawQuiz) as StoredQuiz;
      const parsedQuestions = mapStoredQuizToQuestions(parsedQuiz);
      if (!parsedQuestions.length) {
        return;
      }

      setQuizId(String(parsedQuiz._id || parsedQuiz.id));
      setGeneratedQuestions(parsedQuestions);
      setGenerationMode(parsedQuiz.generationMode || 'standard');
      setRepetitionLevel(Number(parsedQuiz.repetitionLevel || 0));
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizSubmitted(false);
      setServerScore(null);
      setApiError('');
    } catch (error: any) {
      console.error('Failed to load reattempt quiz payload:', error?.message || error);
    } finally {
      sessionStorage.removeItem(REATTEMPT_STORAGE_KEY);
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic || !subject || !gradeClass) return;

    if (!questionTypes.multipleChoice && !questionTypes.trueFalse && !questionTypes.shortAnswer) {
      setApiError('Please select at least one question type.');
      return;
    }

    setApiError('');
    setGenerating(true);

    try {
      const response = await apiClient.generateQuiz({
        subject,
        gradeClass,
        topic,
        learningObjectives,
        assessmentType,
        difficulty,
        numberOfQuestions,
        timeLimit,
        questionTypes,
        generationMode,
      });

      const quiz = response?.data?.quiz;
      const questions = (quiz?.questions || []).map((q: any) => ({
        id: String(q._id || q.id),
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));

      setQuizId(String(quiz?.id || quiz?._id));
      setGeneratedQuestions(questions);
      setGenerationMode(quiz?.generationMode || generationMode);
      setRepetitionLevel(Number(quiz?.repetitionLevel || 0));
      setGenerating(false);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizSubmitted(false);
      setServerScore(null);
    } catch (error: any) {
      setApiError(error?.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizId) {
      setQuizSubmitted(true);
      return;
    }

    try {
      setApiError('');
      setSubmitting(true);

      const answers = generatedQuestions.map((q) => ({
        questionId: q.id,
        selectedAnswer: userAnswers[q.id] || '',
      }));

      const response = await apiClient.submitQuizAttempt(quizId, answers, timeLimit * 60);
      const percentageScore = response?.data?.quizAttempt?.percentageScore;
      setServerScore(typeof percentageScore === 'number' ? percentageScore : null);
      setQuizSubmitted(true);
    } catch (error: any) {
      setApiError(error?.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    generatedQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return (correct / generatedQuestions.length) * 100;
  };

  const resetGenerator = () => {
    setGeneratedQuestions([]);
    setQuizId(null);
    setTopic('');
    setSubject('');
    setGradeClass('');
    setLearningObjectives('');
    setGenerationMode('standard');
    setRepetitionLevel(0);
    setUserAnswers({});
    setQuizSubmitted(false);
    setApiError('');
    setServerScore(null);
  };

  if (generatedQuestions.length > 0 && !quizSubmitted) {
    const currentQuestion = generatedQuestions[currentQuestionIndex];

    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold">Taking Quiz</h1>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {generatedQuestions.length}
            </div>
          </div>
          <div className="w-full bg-border rounded-full h-2 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / generatedQuestions.length) * 100}%` }}
              className="bg-primary h-2 rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-background border border-border rounded-xl p-6 lg:p-8 mb-6"
        >
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-primary font-semibold">{currentQuestionIndex + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                {currentQuestion.type === 'multiple-choice' ? 'Multiple Choice' :
                 currentQuestion.type === 'true-false' ? 'True/False' : 'Short Answer'}
              </p>
              <h3 className="text-lg lg:text-xl font-semibold">{currentQuestion.question}</h3>
            </div>
          </div>

          {currentQuestion.type === 'short-answer' ? (
            <textarea
              value={userAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full min-h-32 p-4 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
            />
          ) : (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    userAnswers[currentQuestion.id] === option
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      userAnswers[currentQuestion.id] === option
                        ? 'border-primary'
                        : 'border-border'
                    }`}>
                      {userAnswers[currentQuestion.id] === option && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        <div className="flex gap-3">
          {currentQuestionIndex > 0 && (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent"
            >
              Previous
            </button>
          )}
          {currentQuestionIndex < generatedQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={!userAnswers[currentQuestion.id]}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting || Object.keys(userAnswers).length !== generatedQuestions.length}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (quizSubmitted) {
    const score = serverScore ?? calculateScore();
    const correctAnswers = generatedQuestions.filter(q => userAnswers[q.id] === q.correctAnswer).length;

    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background border border-border rounded-xl p-8 text-center"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            score >= 70 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
          }`}>
            <CheckCircle className={`w-10 h-10 ${
              score >= 70 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
            }`} />
          </div>

          <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-muted-foreground mb-8">
            You answered {correctAnswers} out of {generatedQuestions.length} questions correctly
          </p>

          <div className="text-6xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {score.toFixed(0)}%
          </div>

          <div className="space-y-4 mb-8">
            {generatedQuestions.map((q, index) => {
              const isCorrect = userAnswers[q.id] === q.correctAnswer;
              return (
                <div key={q.id} className="p-4 border border-border rounded-lg text-left">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-bold text-xs">✕</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-1">Question {index + 1}</p>
                      <p className="text-sm text-muted-foreground mb-2">{q.question}</p>
                      {!isCorrect && (
                        <>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            Your answer: {userAnswers[q.id] || 'No answer'}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Correct answer: {q.correctAnswer}
                          </p>
                        </>
                      )}
                      <p className="text-sm text-muted-foreground mt-2 italic">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetGenerator}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
            >
              Generate New Quiz
            </button>
          </div>

          {generationMode === 'spaced-repetition' && repetitionLevel > 0 && (
            <div className="mt-6 rounded-lg border border-border bg-accent/20 p-4 text-sm text-muted-foreground">
              Spaced repetition round saved: level {repetitionLevel}. Future generations will continue advancing from this history.
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">AI Quiz Generator</h1>
        <p className="text-muted-foreground">
          Enter your topic and preferences, and let AI create a personalized quiz for you
        </p>
      </motion.div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setGenerationMode('standard')}
          className={`rounded-xl border p-4 text-left transition-all ${
            generationMode === 'standard'
              ? 'border-primary bg-primary/10'
              : 'border-border bg-background hover:bg-accent'
          }`}
        >
          <p className="font-semibold">Standard practice</p>
          <p className="text-sm text-muted-foreground mt-1">Generate a fresh quiz from your selected topic.</p>
        </button>

        <button
          type="button"
          onClick={() => setGenerationMode('spaced-repetition')}
          className={`rounded-xl border p-4 text-left transition-all ${
            generationMode === 'spaced-repetition'
              ? 'border-primary bg-primary/10'
              : 'border-border bg-background hover:bg-accent'
          }`}
        >
          <p className="font-semibold">Spaced repetition</p>
          <p className="text-sm text-muted-foreground mt-1">Each repeat raises the level and avoids older question patterns.</p>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6"
        >
          <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-semibold mb-2">AI-Powered</h3>
          <p className="text-sm text-muted-foreground">
            Smart question generation based on your topic
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold mb-2">Customizable</h3>
          <p className="text-sm text-muted-foreground">
            Choose difficulty and question types
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold mb-2">Instant Results</h3>
          <p className="text-sm text-muted-foreground">
            Get feedback and explanations immediately
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-background border border-border rounded-xl p-6 lg:p-8"
      >
        <h2 className="text-xl font-semibold mb-6">Quiz Configuration</h2>

        {generationMode === 'spaced-repetition' && (
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="font-medium text-primary">Spaced repetition is enabled</p>
            <p className="text-sm text-muted-foreground mt-1">
              The next quiz will use your saved history to generate a harder variant and preserve the repetition round.
            </p>
          </div>
        )}

        {apiError && (
          <div className="mb-4 p-3 rounded-lg border border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
            {apiError}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Physics, Chemistry, Biology"
                className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Grade/Class <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={gradeClass}
                onChange={(e) => setGradeClass(e.target.value)}
                placeholder="e.g., 10th Grade, College - Freshman"
                className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Quadratic Equations, Photosynthesis, American Revolution"
              className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Assessment Type</label>
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value as 'formative' | 'summative' | 'diagnostic')}
                className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              >
                <option value="formative">Formative (Practice)</option>
                <option value="summative">Summative (Final Exam)</option>
                <option value="diagnostic">Diagnostic (Pre-assessment)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Learning Objectives
            </label>
            <textarea
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              placeholder="e.g., Students will be able to solve quadratic equations using multiple methods, understand real-world applications"
              className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none min-h-20 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Helps AI generate more targeted questions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTimeLimit(Math.max(5, timeLimit - 5))}
                  className="w-10 h-10 bg-accent border border-border rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Minus className="w-5 h-5 mx-auto" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold">{timeLimit}</span>
                  <p className="text-xs text-muted-foreground">min</p>
                </div>
                <button
                  onClick={() => setTimeLimit(Math.min(180, timeLimit + 5))}
                  className="w-10 h-10 bg-accent border border-border rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setNumberOfQuestions(Math.max(5, numberOfQuestions - 5))}
                  className="w-10 h-10 bg-accent border border-border rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Minus className="w-5 h-5 mx-auto" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold">{numberOfQuestions}</span>
                  <p className="text-xs text-muted-foreground">questions</p>
                </div>
                <button
                  onClick={() => setNumberOfQuestions(Math.min(50, numberOfQuestions + 5))}
                  className="w-10 h-10 bg-accent border border-border rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Question Types</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionTypes.multipleChoice}
                  onChange={(e) => setQuestionTypes(prev => ({ ...prev, multipleChoice: e.target.checked }))}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex-1">
                  <p className="font-medium">Multiple Choice</p>
                  <p className="text-sm text-muted-foreground">Choose from multiple options</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionTypes.trueFalse}
                  onChange={(e) => setQuestionTypes(prev => ({ ...prev, trueFalse: e.target.checked }))}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex-1">
                  <p className="font-medium">True/False</p>
                  <p className="text-sm text-muted-foreground">Simple true or false questions</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionTypes.shortAnswer}
                  onChange={(e) => setQuestionTypes(prev => ({ ...prev, shortAnswer: e.target.checked }))}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex-1">
                  <p className="font-medium">Short Answer</p>
                  <p className="text-sm text-muted-foreground">Write brief text responses</p>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic || !subject || !gradeClass || generating || (!questionTypes.multipleChoice && !questionTypes.trueFalse && !questionTypes.shortAnswer)}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Quiz with AI
              </>
            )}
          </button>
        </div>
      </motion.div>

    </div>
  );
}
