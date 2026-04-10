import { motion } from 'motion/react';
import { TrendingUp, Target, AlertCircle, Clock3, BrainCircuit, Lightbulb, BadgeCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

type Attempt = {
  _id?: string;
  id?: string;
  percentageScore?: number;
  timeSpent?: number;
  completedAt?: string;
  createdAt?: string;
  status?: string;
  quizId?: {
    subject?: string;
    topic?: string;
  };
};

type Streak = {
  current: number;
  longest: number;
  lastQuizCompletedAt?: string | null;
};

type SkillInsight = {
  name: string;
  average: number;
  attempts: number;
  label: 'known' | 'developing' | 'weak';
  suggestion: string;
};

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    completedQuizzes: 0,
    totalTimeSpent: 0,
  });
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0, lastQuizCompletedAt: null });
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.getUserProgress();
        const backendStats = response?.data?.stats;
        const backendStreak = response?.data?.streak;

        setStats({
          totalQuizzes: backendStats?.totalQuizzes || 0,
          averageScore: Number(backendStats?.averageScore || 0),
          completedQuizzes: backendStats?.completedQuizzes || 0,
          totalTimeSpent: backendStats?.totalTimeSpent || 0,
        });
        setStreak({
          current: Number(backendStreak?.current || 0),
          longest: Number(backendStreak?.longest || 0),
          lastQuizCompletedAt: backendStreak?.lastQuizCompletedAt || null,
        });
        setAttempts(Array.isArray(response?.data?.attempts) ? response.data.attempts : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const hoursSpent = (stats.totalTimeSpent / 3600).toFixed(1);
  const sortedAttempts = [...attempts].sort((a, b) => {
    const aTime = new Date(a.completedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.completedAt || b.createdAt || 0).getTime();
    return aTime - bTime;
  });

  const labels = sortedAttempts.length
    ? sortedAttempts.map((attempt, index) => {
        const date = new Date(attempt.completedAt || attempt.createdAt || Date.now());
        if (Number.isNaN(date.getTime())) {
          return `Attempt ${index + 1}`;
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      })
    : ['No Attempts'];

  const scoreSeries = sortedAttempts.length
    ? sortedAttempts.map((attempt) => Number(attempt.percentageScore || 0))
    : [0];

  const timeSeriesMins = sortedAttempts.length
    ? sortedAttempts.map((attempt) => Number((attempt.timeSpent || 0) / 60).toFixed(1))
    : [0];

  const masteredCount = sortedAttempts.filter((a) => Number(a.percentageScore || 0) >= 80).length;
  const developingCount = sortedAttempts.filter((a) => {
    const score = Number(a.percentageScore || 0);
    return score >= 50 && score < 80;
  }).length;
  const needsAttentionCount = sortedAttempts.filter((a) => Number(a.percentageScore || 0) < 50).length;

  const scoreTrendData = {
    labels,
    datasets: [
      {
        label: 'Score %',
        data: scoreSeries,
        tension: 0.35,
        borderColor: '#5b5cf6',
        backgroundColor: 'rgba(91, 92, 246, 0.18)',
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: '#5b5cf6',
        pointRadius: 3,
      },
    ],
  };

  const studyTimeData = {
    labels,
    datasets: [
      {
        label: 'Minutes Spent',
        data: timeSeriesMins,
        borderRadius: 8,
        backgroundColor: '#06b6d4',
      },
    ],
  };

  const scoreBandData = {
    labels: ['Mastered (80-100)', 'Developing (50-79)', 'Needs Attention (<50)'],
    datasets: [
      {
        data: [masteredCount, developingCount, needsAttentionCount],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderColor: ['#16a34a', '#d97706', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (v: number | string) => `${v}%` },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const latestScore = sortedAttempts.length ? Number(sortedAttempts[sortedAttempts.length - 1]?.percentageScore || 0) : 0;
  const previousScore = sortedAttempts.length > 1 ? Number(sortedAttempts[sortedAttempts.length - 2]?.percentageScore || 0) : latestScore;
  const scoreDelta = latestScore - previousScore;
  const trendText =
    sortedAttempts.length <= 1
      ? 'Take a few more quizzes to unlock a stronger trend signal.'
      : scoreDelta >= 0
      ? `Your latest attempt improved by ${scoreDelta.toFixed(1)} points. Keep this momentum.`
      : `Your latest attempt dropped by ${Math.abs(scoreDelta).toFixed(1)} points. Review weak topics and retry.`;

  const skillMap = sortedAttempts.reduce((acc, attempt) => {
    const subject = attempt.quizId?.subject?.trim();
    const topic = attempt.quizId?.topic?.trim();
    const skillName = topic || subject || 'General Learning';
    const score = Number(attempt.percentageScore || 0);

    if (!acc.has(skillName)) {
      acc.set(skillName, { total: 0, count: 0 });
    }

    const current = acc.get(skillName)!;
    current.total += score;
    current.count += 1;
    return acc;
  }, new Map<string, { total: number; count: number }>());

  const skillInsights: SkillInsight[] = Array.from(skillMap.entries())
    .map(([name, value]) => {
      const average = value.count > 0 ? value.total / value.count : 0;
      const label: SkillInsight['label'] = average >= 80 ? 'known' : average >= 55 ? 'developing' : 'weak';

      let suggestion = 'Keep practicing with mixed-difficulty quizzes to maintain consistency.';
      if (label === 'known') {
        suggestion = 'You are strong here. Try hard-level quizzes and teach-back revision to lock mastery.';
      } else if (label === 'developing') {
        suggestion = 'Focus on medium-level questions and review explanations after each attempt.';
      } else {
        suggestion = 'Start with fundamentals, use short quizzes daily, and revisit mistakes before next attempt.';
      }

      return {
        name,
        average,
        attempts: value.count,
        label,
        suggestion,
      };
    })
    .sort((a, b) => b.average - a.average);

  const knownSkills = skillInsights.filter((s) => s.label === 'known').slice(0, 5);
  const focusSkills = skillInsights.filter((s) => s.label !== 'known').slice(0, 5);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Progress Predictor</h1>
        <p className="text-muted-foreground">
          AI-powered insights into your learning journey
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-1">Performance Trends</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Score trend and study-time distribution from your real quiz attempts.
          </p>

          {loading ? (
            <div className="h-64 flex items-center justify-center bg-accent/30 rounded-lg">
              <p className="text-muted-foreground">Loading progress...</p>
            </div>
          ) : error ? (
            <div className="h-64 flex items-center justify-center bg-accent/30 rounded-lg text-center p-4">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-accent/20">
                  <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                  <p className="text-2xl font-bold mt-1">{stats.completedQuizzes}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-accent/20">
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold mt-1">{stats.averageScore.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-accent/20">
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalQuizzes}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-accent/20">
                  <p className="text-sm text-muted-foreground">Study Time</p>
                  <p className="text-2xl font-bold mt-1">{hoursSpent}h</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-accent/20">
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="text-2xl font-bold mt-1">{streak.current} day{streak.current === 1 ? '' : 's'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Longest: {streak.longest} day{streak.longest === 1 ? '' : 's'}</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg border border-border bg-accent/10">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">Score Over Time</p>
                  </div>
                  <div className="h-64">
                    <Line data={scoreTrendData} options={lineOptions} />
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border bg-accent/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock3 className="w-4 h-4 text-cyan-600" />
                    <p className="text-sm font-medium">Study Time per Attempt (min)</p>
                  </div>
                  <div className="h-64">
                    <Bar data={studyTimeData} options={barOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">AI Predictions</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium">On Track</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your current average, you're likely to score around {Math.min(100, Math.round(stats.averageScore + 5))}% on your next quiz.
              </p>
            </div>

            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="font-medium">Needs Focus</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete more quizzes to improve prediction accuracy and strengthen weak topics.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-accent/10">
              <p className="text-sm font-medium mb-3">Score Band Breakdown</p>
              <div className="h-48">
                <Doughnut
                  data={scoreBandData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                        labels: { boxWidth: 10 },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-accent/10">
              <p className="text-sm font-medium mb-1">Trend Insight</p>
              <p className="text-sm text-muted-foreground">{trendText}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-background border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Skill Intelligence</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Predicted strengths and suggested focus areas based on your quiz history by topic and subject.
        </p>

        {loading ? (
          <div className="h-28 flex items-center justify-center bg-accent/20 rounded-lg">
            <p className="text-muted-foreground">Analyzing your skills...</p>
          </div>
        ) : skillInsights.length === 0 ? (
          <div className="h-28 flex items-center justify-center bg-accent/20 rounded-lg text-center px-4">
            <p className="text-muted-foreground">No enough quiz data yet. Complete a few quizzes and we will map your strongest skills.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-border p-4 bg-accent/10">
              <div className="flex items-center gap-2 mb-3">
                <BadgeCheck className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium">Skills You Likely Know Well</p>
              </div>
              <div className="space-y-3">
                {knownSkills.length > 0 ? (
                  knownSkills.map((skill) => (
                    <div key={`known-${skill.name}`} className="rounded-md border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-sm">{skill.name}</p>
                        <p className="text-xs text-muted-foreground">{skill.average.toFixed(1)}%</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{skill.attempts} attempt{skill.attempts > 1 ? 's' : ''}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No skill has crossed mastery threshold yet. Keep going.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 bg-accent/10">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-medium">Suggested Focus Skills</p>
              </div>
              <div className="space-y-3">
                {focusSkills.length > 0 ? (
                  focusSkills.map((skill) => (
                    <div key={`focus-${skill.name}`} className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-sm">{skill.name}</p>
                        <p className="text-xs text-muted-foreground">{skill.average.toFixed(1)}%</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{skill.suggestion}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Great job, no weak skill signals right now.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
