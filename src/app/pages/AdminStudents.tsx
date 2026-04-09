import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, ChevronDown, ShieldBan, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../services/api';

interface Student {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  performance: number | null;
  totalAttempts: number;
  avatar: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [actionLoadingId, setActionLoadingId] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.getAdminStudentsOverview();
        const users = response?.data?.students || [];

        const mapped: Student[] = users.map((u: any) => ({
          id: String(u._id || u.id),
          name: u.name || 'Unknown',
          email: u.email || '',
          status: u.status || 'inactive',
          performance: typeof u.performance === 'number' ? u.performance : null,
          totalAttempts: Number(u.totalAttempts || 0),
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'Student')}&background=6366f1&color=fff`,
        }));

        setStudents(mapped);
      } catch (err: any) {
        setError(err?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === 'active').length,
    inactive: students.filter((s) => s.status === 'inactive').length,
    suspended: students.filter((s) => s.status === 'suspended').length,
  };

  const refreshStudents = async () => {
    const response = await apiClient.getAdminStudentsOverview();
    const users = response?.data?.students || [];

    setStudents(
      users.map((u: any) => ({
        id: String(u._id || u.id),
        name: u.name || 'Unknown',
        email: u.email || '',
        status: u.status || 'inactive',
        performance: typeof u.performance === 'number' ? u.performance : null,
        totalAttempts: Number(u.totalAttempts || 0),
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'Student')}&background=6366f1&color=fff`,
      }))
    );
  };

  const toggleStudentStatus = async (studentId: string, status: 'active' | 'suspended') => {
    try {
      setActionLoadingId(studentId);
      if (status === 'suspended') {
        await apiClient.suspendStudent(studentId);
      } else {
        await apiClient.unsuspendStudent(studentId);
      }
      await refreshStudents();
    } catch (err: any) {
      setError(err?.message || 'Failed to update student status');
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Student Management</h1>
        <p className="text-muted-foreground">View and manage registered students from backend data</p>
      </motion.div>

      {error && (
        <div className="mb-6 p-3 rounded-lg border border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Students</span>
            <UserCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold">{loading ? '...' : stats.total}</div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active</span>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-3xl font-bold">{loading ? '...' : stats.active}</div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Inactive</span>
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          </div>
          <div className="text-3xl font-bold">{loading ? '...' : stats.inactive}</div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Suspended</span>
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold">{loading ? '...' : stats.suspended}</div>
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email"
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'suspended')}
              className="pl-4 pr-10 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/50 border-b border-border">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold">Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Email</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Performance</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full" />
                      <div className="font-medium">{student.name}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm">{student.email}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      student.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : student.status === 'inactive'
                        ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      {typeof student.performance === 'number' ? (
                        <>
                          <span className="font-medium">{student.performance.toFixed(1)}%</span>
                          <span className="text-muted-foreground"> ({student.totalAttempts} attempts)</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">No attempts yet</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {student.status === 'suspended' ? (
                        <button
                          onClick={() => toggleStudentStatus(student.id, 'active')}
                          disabled={actionLoadingId === student.id}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          {actionLoadingId === student.id ? 'Restoring...' : 'Unban'}
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleStudentStatus(student.id, 'suspended')}
                          disabled={actionLoadingId === student.id}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <ShieldBan className="w-4 h-4" />
                          {actionLoadingId === student.id ? 'Banning...' : 'Ban'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && !loading && (
          <div className="py-12 text-center text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No students found</p>
          </div>
        )}
      </div>
    </div>
  );
}
