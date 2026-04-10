import { motion } from 'motion/react';
import { Flame, Trophy, CalendarCheck2, Sparkles, ArrowRight, TimerReset } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { apiClient } from '../../services/api';

type Streak = {
  current: number;
  longest: number;
  lastQuizCompletedAt?: string | null;
};

function formatRelativeDay(value?: string | null) {
  if (!value) return 'No quiz completed yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No quiz completed yet';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function buildDayPreview(current: number) {
  const visibleDays = Math.max(7, current);
  return Array.from({ length: visibleDays }, (_, index) => {
    const dayNumber = index + 1;
    return {
      dayNumber,
      active: dayNumber <= current,
      label: `Day ${dayNumber}`,
    };
  });
}

export default function StreakProgressPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0, lastQuizCompletedAt: null });

  useEffect(() => {
    const loadStreak = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiClient.getUserProgress();
        const backendStreak = response?.data?.streak || {};

        setStreak({
          current: Number(backendStreak.current || 0),
          longest: Number(backendStreak.longest || 0),
          lastQuizCompletedAt: backendStreak.lastQuizCompletedAt || null,
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to load streak data');
      } finally {
        setLoading(false);
      }
    };

    loadStreak();
  }, []);

  const dayPreview = useMemo(() => buildDayPreview(streak.current), [streak.current]);
  const streakTarget = 1;
  const isGoalMet = streak.current >= streakTarget;
  const nextMilestone = streak.current > 0 && streak.current % 7 === 0 ? streak.current + 7 : Math.max(7, streak.current + 1);
  const progressToMilestone = Math.min(100, Math.round((streak.current / nextMilestone) * 100));

  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_26%),linear-gradient(180deg,_#fff7ed_0%,_#fff_40%,_#fff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.04),_transparent_26%),linear-gradient(180deg,_#1f1307_0%,_#120b04_40%,_#0f0a05_100%)]">
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle,_rgba(251,146,60,0.14)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative p-4 lg:p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-orange-700 shadow-sm backdrop-blur dark:border-orange-900/50 dark:bg-black/20 dark:text-orange-300">
            <Flame className="w-4 h-4" />
            Streak Progress Viewer
          </div>
          <h1 className="mt-4 text-3xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            One quiz a day. Keep the flame alive.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Complete at least one quiz every day to continue your streak. The page below turns that rule into something visible, simple, and motivating.
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="relative overflow-hidden rounded-3xl border border-orange-200/70 bg-white/85 p-6 shadow-[0_24px_80px_-24px_rgba(249,115,22,0.35)] backdrop-blur dark:border-orange-900/40 dark:bg-black/25"
          >
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="absolute -bottom-10 left-1/3 h-28 w-28 rounded-full bg-amber-300/20 blur-3xl" />

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-100 p-6 text-center dark:border-orange-900/30 dark:from-orange-950/40 dark:to-amber-950/40">
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white shadow-[0_0_60px_rgba(251,146,60,0.45)]"
                >
                  <div className="absolute inset-4 rounded-full border border-white/20" />
                  <div className="absolute inset-8 rounded-full bg-white/10 blur-md" />
                  <div className="relative">
                    <Flame className="mx-auto h-12 w-12" />
                    <p className="mt-2 text-4xl font-black">{streak.current}</p>
                    <p className="mt-1 text-sm text-white/85">day streak</p>
                  </div>
                </motion.div>

                <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">Current streak</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{streak.current} day{streak.current === 1 ? '' : 's'} in a row</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Last quiz: {formatRelativeDay(streak.lastQuizCompletedAt)}</p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-background/80 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarCheck2 className="w-4 h-4 text-orange-500" />
                      Daily rule
                    </div>
                    <p className="mt-2 text-2xl font-bold">1 quiz</p>
                    <p className="text-sm text-muted-foreground">per day</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/80 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Longest streak
                    </div>
                    <p className="mt-2 text-2xl font-bold">{streak.longest}</p>
                    <p className="text-sm text-muted-foreground">days</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/80 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TimerReset className="w-4 h-4 text-cyan-500" />
                      Goal
                    </div>
                    <p className="mt-2 text-2xl font-bold">Keep going</p>
                    <p className="text-sm text-muted-foreground">never miss a day</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-slate-950 p-5 text-white shadow-inner dark:bg-black/55">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/70">Milestone tracker</p>
                      <p className="text-xl font-semibold">Next milestone: {nextMilestone} days</p>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
                      {progressToMilestone}%
                    </div>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToMilestone}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300"
                    />
                  </div>
                  <p className="mt-3 text-sm text-white/70">
                    Your streak updates only when you complete a quiz on a new day. Multiple quizzes on the same day keep the streak alive, but do not add extra streak days.
                  </p>
                </div>

                <div className={`rounded-2xl border p-4 ${isGoalMet ? 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/30' : 'border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/30'}`}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Daily streak status
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isGoalMet
                      ? 'You completed today’s minimum quiz goal. Come back tomorrow to keep the streak alive.'
                      : 'Complete one quiz today to start or continue your streak.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-3xl border border-border bg-white/85 p-6 shadow-xl backdrop-blur dark:bg-black/25"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Streak Timeline</h2>
                <p className="text-sm text-muted-foreground">Animated day-by-day view</p>
              </div>
              <Flame className="w-6 h-6 text-orange-500" />
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  Loading streak viewer...
                </div>
              ) : (
                dayPreview.map((day, index) => (
                  <motion.div
                    key={day.dayNumber}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 rounded-2xl border p-4 ${day.active ? 'border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/30' : 'border-border bg-background/70'}`}
                  >
                    <motion.div
                      animate={day.active ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                      transition={day.active ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black ${day.active ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}
                    >
                      {day.dayNumber}
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{day.label}</p>
                        {day.active && <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-300">Completed</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {day.active
                          ? 'Quiz completed. Streak is alive.'
                          : 'Keep your one-quiz-per-day rhythm to unlock this day.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className={`h-2 w-2 rounded-full ${day.active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-6 flex flex-col gap-4 rounded-3xl border border-border bg-white/80 p-6 shadow-lg backdrop-blur dark:bg-black/25 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">Need to keep the streak alive?</p>
            <p className="text-sm text-muted-foreground">Open the quiz generator, finish one quiz today, and the streak will continue tomorrow.</p>
          </div>
          <Link
            to="/quiz-generator"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.02]"
          >
            Generate Quiz
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}