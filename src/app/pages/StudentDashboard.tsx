import { motion } from 'motion/react';
import {
  TrendingUp,
  Brain,
  Target,
  Award,
  CheckCircle,
  ArrowRight,
  Zap,
  BookOpen,
  Calendar,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../services/api';

interface QuizAttempt {
  _id?: string;
  id?: string;
  percentageScore: number;
  completedAt?: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  quizId?: {
    subject?: string;
    topic?: string;
    numberOfQuestions?: number;
  };
}

interface LearningStreak {
  current: number;
  longest: number;
  lastQuizCompletedAt?: string | null;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    completedQuizzes: 0,
    totalTimeSpent: 0,
  });
  const [streak, setStreak] = useState<LearningStreak>({ current: 0, longest: 0, lastQuizCompletedAt: null });
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [progressResponse] = await Promise.all([
          apiClient.getUserProgress(),
        ]);

        const backendStats = progressResponse?.data?.stats || {};
        const backendAttempts = progressResponse?.data?.attempts || [];
        const backendStreak = progressResponse?.data?.streak || {};

        setStats({
          totalQuizzes: Number(backendStats.totalQuizzes || 0),
          averageScore: Number(backendStats.averageScore || 0),
          completedQuizzes: Number(backendStats.completedQuizzes || 0),
          totalTimeSpent: Number(backendStats.totalTimeSpent || 0),
        });

        setAttempts(backendAttempts);
        setStreak({
          current: Number(backendStreak.current || 0),
          longest: Number(backendStreak.longest || 0),
          lastQuizCompletedAt: backendStreak.lastQuizCompletedAt || null,
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const recentAttempts = useMemo(() => {
    return [...attempts]
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
      .slice(0, 5);
  }, [attempts]);

  const hoursSpent = (stats.totalTimeSpent / 3600).toFixed(1);

  const statCards = [
    {
      label: 'Quizzes Completed',
      value: String(stats.completedQuizzes),
      change: `${stats.totalQuizzes} total`,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Average Score',
      value: `${stats.averageScore.toFixed(1)}%`,
      change: 'based on completed attempts',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Study Time',
      value: `${hoursSpent}h`,
      change: 'total time tracked',
      icon: Zap,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      label: 'Total Attempts',
      value: String(stats.totalQuizzes),
      change: 'all attempts',
      icon: Award,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Current Streak',
      value: `${streak.current} day${streak.current === 1 ? '' : 's'}`,
      change: `Longest streak: ${streak.longest} day${streak.longest === 1 ? '' : 's'}`,
      icon: Calendar,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">Here is your real-time learning overview</p>
      </motion.div>

      {error && (
        <div className="mb-6 p-3 rounded-lg border border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                Live
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{loading ? '...' : stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.change}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-background border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Attempts</h2>
            <Link to="/quiz-generator" className="text-primary hover:underline text-sm font-medium">
              New Quiz
            </Link>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading attempts...</p>
          ) : recentAttempts.length === 0 ? (
            <div className="p-6 bg-accent/30 rounded-lg text-center">
              <p className="text-muted-foreground">No quiz attempts yet. Generate your first quiz.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt._id || attempt.id}
                  className="flex items-center gap-4 p-4 bg-accent/30 rounded-lg"
                >
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {attempt.quizId?.subject || 'Subject'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {attempt.quizId?.numberOfQuestions || '-'} questions
                      </span>
                    </div>
                    <h3 className="font-medium truncate">{attempt.quizId?.topic || 'Quiz Attempt'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'In progress'}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-green-600">{attempt.percentageScore?.toFixed(0) || 0}%</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Actions</h2>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            <Link to="/quiz-generator" className="block p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <Brain className="mt-1 w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1">Generate AI Quiz</h3>
                  <p className="text-sm text-muted-foreground">Create a personalized quiz using Gemini</p>
                </div>
              </div>
            </Link>

            <Link to="/progress" className="block p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <Clock className="mt-1 w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">See your score trends and learning metrics</p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <Link
          to="/quiz-generator"
          className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-shadow"
        >
          <Brain className="w-10 h-10 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Generate New Quiz</h3>
          <p className="text-sm text-white/80 mb-4">Create AI-powered quizzes from your study materials</p>
          <div className="flex items-center gap-2 text-sm font-medium">
            Start Now <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/resources"
          className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-shadow"
        >
          <BookOpen className="w-10 h-10 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Study Resources</h3>
          <p className="text-sm text-white/80 mb-4">Access your uploaded materials and resources</p>
          <div className="flex items-center gap-2 text-sm font-medium">
            Browse <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/progress"
          className="p-6 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-shadow"
        >
          <Target className="w-10 h-10 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Performance Insights</h3>
          <p className="text-sm text-white/80 mb-4">Get insights into your learning patterns</p>
          <div className="flex items-center gap-2 text-sm font-medium">
            View Insights <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
