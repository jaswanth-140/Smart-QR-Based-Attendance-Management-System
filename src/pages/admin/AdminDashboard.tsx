import { AdminSidebarLayout } from '@/components/layout/AdminSidebarLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { Users, BookOpen, Activity, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const activityLog = [
  { text: 'Dr. Smith started a live session — CS101', time: '2 minutes ago', type: 'session' },
  { text: 'New student registered: John Doe', time: '15 minutes ago', type: 'user' },
  { text: 'Attendance override: CS202 (Dr. Kim)', time: '1 hour ago', type: 'override' },
  { text: 'System backup completed', time: '3 hours ago', type: 'system' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [students, teachers, courses] = await Promise.all([
          api.get<unknown[]>('/users/students'),
          api.get<unknown[]>('/users/teachers'),
          api.get<unknown[]>('/courses'),
        ]);
        setStats({ students: students.length, teachers: teachers.length, courses: courses.length });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <AdminSidebarLayout
      breadcrumbs={[
        { label: 'Home', to: '/admin/dashboard' },
        { label: 'Dashboard' },
      ]}
    >
      <div className="space-y-6 max-w-6xl">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={loading ? '...' : String(stats.students)} icon={Users} subtitle="All enrolled" />
          <StatCard title="Total Teachers" value={loading ? '...' : String(stats.teachers)} icon={BookOpen} subtitle="Active faculty" />
          <StatCard title="Active Courses" value={loading ? '...' : String(stats.courses)} icon={Activity} subtitle="Current catalog" />
          <StatCard title="Avg. Attendance" value="Live" icon={CheckCircle} subtitle="From course reports" trend="up" />
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLog.map((item, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSidebarLayout>
  );
}
