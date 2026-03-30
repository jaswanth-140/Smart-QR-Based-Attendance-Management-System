import { TeacherTopNavbarLayout } from '@/components/layout/TeacherTopNavbarLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfidenceBadge } from '@/components/StatusBadge';
import { useAttendanceStore } from '@/store/attendanceStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useEffect } from 'react';
import { MoreVertical, CheckCircle, AlertTriangle, UserX } from 'lucide-react';

export default function AttendancePage() {
  const { records, sessions, loadSessionAttendance, isLoading, error, clearError } = useAttendanceStore();
  const [selectedSession, setSelectedSession] = useState(sessions[0]?.id || '');
  const filtered = records.filter((r) => r.session_id === selectedSession);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0].id);
    }
  }, [sessions, selectedSession]);

  useEffect(() => {
    if (!selectedSession) return;
    void loadSessionAttendance(selectedSession);
  }, [selectedSession, loadSessionAttendance]);

  const highCount = filtered.filter(r => r.confidence === 'high').length;
  const reviewCount = filtered.filter(r => r.confidence === 'review').length;
  const absentCount = filtered.filter(r => r.status === 'absent').length;

  return (
    <TeacherTopNavbarLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Session Selector */}
        <Select value={selectedSession} onValueChange={setSelectedSession}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.course_code} — {s.date} ({s.start_time})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading && <p className="text-sm text-muted-foreground">Loading session attendance...</p>}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>Dismiss</Button>
          </div>
        )}

        {/* Student Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="uppercase text-xs tracking-wider">Student Name</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">
                    Time Marked <span className="text-muted-foreground/50">▼</span>
                  </TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">
                    Distance (m) <span className="text-muted-foreground/50 cursor-help">ⓘ</span>
                  </TableHead>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No records for this session</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bottom Summary Strip */}
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
      </div>
    </TeacherTopNavbarLayout>
  );
}
