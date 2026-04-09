import { motion } from 'motion/react';
import { Users, Brain, AlertTriangle, Activity, ShieldCheck, UserPlus, BookOpen, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  totalQuizzes: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number | string;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt?: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalAdmins: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
    completedAttempts: 0,
    averageScore: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError('');
        const [statsResponse, usersResponse] = await Promise.all([
          apiClient.getAdminStats(),
          apiClient.getAllUsers(1, 5),
        ]);

        const backend = statsResponse?.data?.stats || {};
        setStats({
          totalUsers: Number(backend.totalUsers || 0),
          totalStudents: Number(backend.totalStudents || 0),
          totalAdmins: Number(backend.totalAdmins || 0),
          totalQuizzes: Number(backend.totalQuizzes || 0),
          totalAttempts: Number(backend.totalAttempts || 0),
          completedAttempts: Number(backend.completedAttempts || 0),
          averageScore: backend.averageScore || 0,
        });

        const users = usersResponse?.data?.users || [];
        setRecentUsers(
          users.map((u: any) => ({
            id: String(u._id || u.id),
            name: u.name || 'Unknown User',
            email: u.email || 'No email',
            role: u.role || 'student',
            createdAt: u.createdAt,
          }))
        );
      } catch (err: any) {
        setError(err?.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      hint: `${stats.totalStudents} students, ${stats.totalAdmins} admins`,
    },
    {
      label: 'Total Quizzes',
      value: stats.totalQuizzes,
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      hint: 'Generated across platform',
    },
    {
      label: 'Completed Attempts',
      value: stats.completedAttempts,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      hint: `${stats.totalAttempts} total attempts`,
    },
    {
      label: 'Average Score',
      value: `${Number(stats.averageScore || 0).toFixed(1)}%`,
      icon: ShieldCheck,
      color: 'from-orange-500 to-yellow-500',
      hint: 'Platform-wide average',
    },
  ];

  const completionRate = stats.totalAttempts > 0
    ? ((stats.completedAttempts / stats.totalAttempts) * 100).toFixed(1)
    : '0.0';

  const studentShare = stats.totalUsers > 0
    ? ((stats.totalStudents / stats.totalUsers) * 100).toFixed(1)
    : '0.0';

  const adminShare = stats.totalUsers > 0
    ? ((stats.totalAdmins / stats.totalUsers) * 100).toFixed(1)
    : '0.0';

  const formatDate = (value?: string) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor real platform metrics from backend</p>
      </motion.div>

      {error && (
        <div className="mb-6 p-3 rounded-lg border border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background border border-border rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-1">{loading ? '...' : card.value}</div>
            <div className="text-sm text-muted-foreground mb-1">{card.label}</div>
            <div className="text-xs text-muted-foreground">{card.hint}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-background border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Users</h2>
            <div className="text-sm text-muted-foreground">Last {recentUsers.length} records</div>
          </div>

          {loading ? (
            <div className="text-muted-foreground">Loading users...</div>
          ) : recentUsers.length === 0 ? (
            <div className="text-muted-foreground">No users found yet.</div>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-accent/20">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      user.role === 'admin'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}>
                      {user.role}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(user.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-background border border-border rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Platform Insights</h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-accent overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Student Share</span>
                <span className="font-medium">{studentShare}%</span>
              </div>
              <div className="h-2 rounded-full bg-accent overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${studentShare}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Admin Share</span>
                <span className="font-medium">{adminShare}%</span>
              </div>
              <div className="h-2 rounded-full bg-accent overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${adminShare}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <h3 className="font-medium mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                <span className="flex items-center gap-2 text-sm"><UserPlus className="w-4 h-4" /> Review new students</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                <span className="flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4" /> Audit latest quizzes</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
