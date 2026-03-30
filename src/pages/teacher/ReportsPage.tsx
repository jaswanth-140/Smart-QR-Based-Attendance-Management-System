import { useState } from 'react';
import { useEffect } from 'react';
import { TeacherTopNavbarLayout } from '@/components/layout/TeacherTopNavbarLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfidenceBadge } from '@/components/StatusBadge';
import { useAttendanceStore } from '@/store/attendanceStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Printer, CheckCircle, AlertTriangle, UserX, RefreshCw, Calendar, MoreVertical, Home, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(150, 60%, 42%)', 'hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)', 'hsl(217, 91%, 50%)'];

export default function ReportsPage() {
  const { records, sessions, courses, loadCourseAttendance, isLoading, error, clearError } = useAttendanceStore();
  const [selectedSession, setSelectedSession] = useState(sessions[0]?.id || '');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const session = sessions.find((s) => s.id === selectedSession);
  const filtered = records.filter((r) => {
    if (r.session_id !== selectedSession) return false;
    if (confidenceFilter !== 'all' && r.confidence !== confidenceFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const highCount = records.filter(r => r.session_id === selectedSession && r.confidence === 'high').length;
  const reviewCount = records.filter(r => r.session_id === selectedSession && r.confidence === 'review').length;
  const absentCount = records.filter(r => r.session_id === selectedSession && r.status === 'absent').length;

  const statusCounts = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    review: records.filter((r) => r.status === 'review').length,
  };

  const pieData = [
    { name: 'Present', value: statusCounts.present },
    { name: 'Absent', value: statusCounts.absent },
    { name: 'Late', value: statusCounts.late },
    { name: 'Review', value: statusCounts.review },
  ];

  const barData = courses.map((c) => {
    const courseRecords = records.filter((record) => {
      const sessionRef = sessions.find((sessionItem) => sessionItem.id === record.session_id);
      return sessionRef?.course_code === c.course_code;
    });

    const attended = courseRecords.filter((record) => record.status === 'present' || record.status === 'late' || record.status === 'excused').length;
    const percentage = courseRecords.length ? Math.round((attended / courseRecords.length) * 100) : 0;

    return {
      name: c.course_code,
      attendance: percentage,
    };
  });

  useEffect(() => {
    const selected = sessions.find((sessionItem) => sessionItem.id === selectedSession);
    if (!selected) return;
    void loadCourseAttendance(selected.course_id);
  }, [selectedSession, sessions, loadCourseAttendance]);

  const breadcrumb = (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Home className="h-3.5 w-3.5" />
      <span>Home</span>
      <ChevronRight className="h-3.5 w-3.5" />
      <span>{session?.course_code || 'CS101'}</span>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="text-foreground font-semibold">Attendance Report</span>
    </nav>
  );

  return (
    <TeacherTopNavbarLayout breadcrumb={breadcrumb}>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance Report: {session?.course_code || 'CS101'}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span>{session?.course_name}</span>
              <span>|</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{session?.date}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success('Printing...')} className="gap-1.5">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button className="gradient-primary gap-1.5" onClick={() => toast.success('CSV exported')}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading report data...</p>}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>Dismiss</Button>
          </div>
        )}

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Filter by Date</label>
                <Input type="date" className="w-[180px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confidence Level</label>
                <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="review">Needs Review</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Attendance Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={() => { setConfidenceFilter('all'); setStatusFilter('all'); }}>
                <RefreshCw className="h-3.5 w-3.5" /> Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card border-l-4 border-l-accent bg-accent/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-accent">High Confidence</p>
                <p className="text-xs text-muted-foreground">Present (&lt; 20m)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-accent">{highCount || 45}</span>
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-l-4 border-l-warning bg-warning/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-warning">Needs Review</p>
                <p className="text-xs text-muted-foreground">Distance Alert (&gt; 20m)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-warning">{reviewCount || 5}</span>
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-l-4 border-l-muted-foreground bg-secondary/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Total Absent</p>
                <p className="text-xs text-muted-foreground">No Check-in</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{absentCount || 10}</span>
                <UserX className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center gap-4">
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.course_code} — {s.date} ({s.start_time})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="uppercase text-xs tracking-wider">Student Name</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Time Marked</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Distance (m)</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                          {r.student_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{r.student_name}</p>
                          <p className="text-xs text-muted-foreground">ID: {r.student_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-sm ${r.distance > 20 ? 'text-warning font-semibold' : ''}`}>
                        {r.distance > 0 ? `${r.distance.toFixed(1)}m` : '—'}
                      </span>
                    </TableCell>
                    <TableCell><ConfidenceBadge confidence={r.confidence} /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No records found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Attendance by Course</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="hsl(217, 91%, 50%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </TeacherTopNavbarLayout>
  );
}
