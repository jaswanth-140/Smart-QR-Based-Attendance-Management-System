import { useState } from 'react';
import { TopNavbarLayout } from '@/components/layout/TopNavbarLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useAttendanceStore } from '@/store/attendanceStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, TrendingUp, GraduationCap, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function MyAttendancePage() {
  const { studentSummaries, records, sessions, isLoading, error, clearError } = useAttendanceStore();
  const [courseFilter, setCourseFilter] = useState('all');

  const overallPercentage = studentSummaries.length
    ? Math.round(studentSummaries.reduce((a, s) => a + s.percentage, 0) / studentSummaries.length)
    : 0;
  const totalAttended = studentSummaries.reduce((a, s) => a + s.attended, 0);
  const totalSessions = studentSummaries.reduce((a, s) => a + s.total_sessions, 0);

  const visibleRecords = records.filter((record) => {
    if (courseFilter === 'all') return true;
    const session = sessions.find((s) => s.id === record.session_id);
    return session?.course_code === courseFilter;
  });

  return (
    <TopNavbarLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance History</h1>
            <p className="text-muted-foreground mt-1">Track your academic presence and review past session details.</p>
          </div>
          <Button variant="outline" onClick={() => toast.success('Export started')} className="gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Overall Attendance</p>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-4xl font-bold">{overallPercentage}%</span>
                <Badge className="bg-accent/15 text-accent border-accent/30 mb-1" variant="outline">+2% vs last month</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Classes Attended</p>
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-4xl font-bold">{totalAttended}</span>
                <span className="text-xl text-muted-foreground mb-0.5">/{totalSessions}</span>
                <Badge className="bg-accent/15 text-accent border-accent/30 mb-1" variant="outline">Good Standing</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Filter by Course</label>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {studentSummaries.map((s) => (
                      <SelectItem key={s.course_code} value={s.course_code}>{s.course_code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date Range</label>
                <Input type="date" className="w-[180px]" />
              </div>
              <Button className="gradient-primary gap-1">
                <Filter className="h-4 w-4" /> Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && <p className="text-sm text-muted-foreground">Loading attendance records...</p>}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>Dismiss</Button>
          </div>
        )}

        {/* Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="uppercase text-xs tracking-wider">Date</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Time</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Code</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Course Name</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Professor</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRecords.map((r) => {
                  const session = sessions.find((s) => s.id === r.session_id);
                  const eventTime = r.timestamp ? new Date(r.timestamp) : null;
                  return (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">{eventTime ? eventTime.toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-sm text-primary">{eventTime ? eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                    <TableCell className="text-sm font-bold">{session?.course_code ?? '—'}</TableCell>
                    <TableCell className="text-sm">{session?.course_name ?? 'Session'}</TableCell>
                    <TableCell className="text-sm">Campus Faculty</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                )})}
                {!isLoading && visibleRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-primary">Showing <span className="font-semibold">{visibleRecords.length}</span> results</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TopNavbarLayout>
  );
}
