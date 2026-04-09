import { motion } from 'motion/react';
import { Mail, Shield, Calendar, Clock, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';

interface AdminInfo {
  name: string;
  email: string;
  role: string;
  avatar: string;
  createdAt?: string;
}

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminInfo, setAdminInfo] = useState<AdminInfo>({
    name: '',
    email: '',
    role: 'Admin',
    avatar: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.getProfile();
        const u = response?.data?.user;

        setAdminInfo({
          name: u?.name || 'Admin',
          email: u?.email || '',
          role: u?.role === 'admin' ? 'Admin' : 'User',
          avatar: u?.avatar || 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff&size=128',
          createdAt: u?.createdAt,
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to load admin profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="p-4 lg:p-8 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Profile</h1>
        <p className="text-muted-foreground">Your account information from backend</p>
      </motion.div>

      {error && (
        <div className="mb-6 p-3 rounded-lg border border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-background border border-border rounded-xl p-6"
      >
        <div className="flex flex-col items-center text-center">
          <img src={adminInfo.avatar} alt={adminInfo.name} className="w-24 h-24 rounded-full mb-4" />
          <h2 className="text-2xl font-bold mb-1">{loading ? 'Loading...' : adminInfo.name}</h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            {adminInfo.role}
          </div>

          <div className="w-full max-w-lg space-y-3 mt-6">
            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <User className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="text-xs text-muted-foreground">Name</div>
                <div className="text-sm font-medium">{adminInfo.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="text-sm font-medium">{adminInfo.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="text-xs text-muted-foreground">Joined</div>
                <div className="text-sm font-medium">
                  {adminInfo.createdAt ? new Date(adminInfo.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="text-sm font-medium">Active</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
