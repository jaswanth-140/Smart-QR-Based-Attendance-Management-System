import { useState } from 'react';
import { useEffect } from 'react';
import { TeacherTopNavbarLayout } from '@/components/layout/TeacherTopNavbarLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { useAttendanceStore, AttendanceStatus } from '@/store/attendanceStore';
import { Search, Save, AlertCircle, X, ChevronLeft, ChevronRight, Filter, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const overrideReasons = [
  'Technical issue with QR scan',
  'Student was present but GPS failed',
  'Late arrival — excused',
  'Medical reason',
  'Other',
];

export default function OverridePage() {
  const { records, sessions, loadSessionAttendance, overrideStatus, isLoading, error, clearError } = useAttendanceStore();
  const [search, setSearch] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Record<string, { status: AttendanceStatus; reason: string }>>({});
  const [studentFilter, setStudentFilter] = useState('all');

  const activeSession = sessions[0];

  useEffect(() => {
    if (!activeSession) return;
    void loadSessionAttendance(activeSession.id);
  }, [activeSession, loadSessionAttendance]);

  const filtered = records
    .filter((record) => record.student_name.toLowerCase().includes(search.toLowerCase()) || record.student_id.toLowerCase().includes(search.toLowerCase()))
    .filter((record) => (studentFilter === 'all' ? true : record.status === studentFilter));

  const handleReasonChange = (id: string, reason: string) => {
    const student = records.find((record) => record.id === id);
    const currentStatus = student?.status || 'present';
    setPendingChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], reason, status: prev[id]?.status || currentStatus },
    }));
  };

  const handleSave = async () => {
    await Promise.all(Object.entries(pendingChanges).map(([id, { status, reason }]) => overrideStatus(id, status, reason)));
    setPendingChanges({});
    toast.success(`${Object.keys(pendingChanges).length} record(s) updated`);
  };

  const handleDiscard = () => {
    setPendingChanges({});
    toast('Changes discarded');
  };

  const changesCount = Object.keys(pendingChanges).length;

  return (
    <TeacherTopNavbarLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attendance Override</h1>
            <p className="text-sm text-muted-foreground mt-1">{activeSession?.course_code ?? 'Session'} — {activeSession?.course_name ?? 'Live Session'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input type="date" className="w-[160px]" defaultValue="2023-10-24" />
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Students" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading session records...</p>}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>Dismiss</Button>
          </div>
        )}

        {/* Override Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="uppercase text-xs tracking-wider">Student</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Student ID</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Current Status</TableHead>
                  <TableHead className="uppercase text-xs tracking-wider">Override Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const isModified = !!pendingChanges[r.id];
                  return (
                    <TableRow key={r.id} className={isModified ? 'bg-primary/[0.03]' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                            {r.student_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{r.student_name}</p>
                            <p className="text-xs text-muted-foreground">Student</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">{r.student_id}</Badge>
                      </TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select onValueChange={(v) => handleReasonChange(r.id, v)}>
                            <SelectTrigger className="w-[240px]">
                              <SelectValue placeholder="Select reason..." />
                            </SelectTrigger>
                            <SelectContent>
                              {overrideReasons.map((reason) => (
                                <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isModified && (
                            <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5 shrink-0">
                              (Modified)
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!isLoading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No records found for override.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold">{filtered.length}</span> result(s)
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="default" size="sm" className="w-8">1</Button>
                <Button variant="outline" size="sm" className="w-8">2</Button>
                <Button variant="outline" size="sm" className="w-8">3</Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Unsaved Changes Bar */}
      {changesCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-warning shadow-elevated">
          <div className="max-w-6xl mx-auto px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium">
                You have <span className="font-bold text-warning">{changesCount}</span> unsaved change{changesCount > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleDiscard} className="gap-1.5 text-muted-foreground">
                <X className="h-4 w-4" /> Discard
              </Button>
              <Button onClick={() => void handleSave()} className="gradient-primary gap-1.5">
                <Save className="h-4 w-4" /> Confirm Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </TeacherTopNavbarLayout>
  );
}
