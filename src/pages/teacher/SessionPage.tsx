import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SessionLayout } from '@/components/layout/SessionLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAttendanceStore } from '@/store/attendanceStore';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessions, records, rotateSessionQr, loadActiveSessions, loadSessionAttendance, endSession, isLoading } =
    useAttendanceStore();
  const session = sessions.find((entry) => entry.id === id);
  const [qrToken, setQrToken] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);

  const sessionRecords = useMemo(
    () =>
      records
        .filter((record) => record.session_id === session?.id)
        .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()),
    [records, session?.id],
  );

  useEffect(() => {
    if (!id || session) return;
    void loadActiveSessions();
  }, [id, loadActiveSessions, session]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    const refreshQr = async () => {
      try {
        setIsRefreshingQr(true);
        const qr = await rotateSessionQr(session.id);
        if (cancelled) return;
        setQrToken(qr.qrToken);
        setExpiresAt(qr.expiresAt);
        setCountdown(qr.refreshIntervalSeconds);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Unable to refresh QR code.';
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsRefreshingQr(false);
        }
      }
    };

    void refreshQr();
    const intervalId = window.setInterval(() => {
      void refreshQr();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [rotateSessionQr, session]);

  useEffect(() => {
    if (!session) return;

    const refreshAttendance = async () => {
      await loadSessionAttendance(session.id);
    };

    void refreshAttendance();
    const intervalId = window.setInterval(() => {
      void refreshAttendance();
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadSessionAttendance, session]);

  useEffect(() => {
    if (!expiresAt) return;

    const intervalId = window.setInterval(() => {
      const remainingMs = new Date(expiresAt).getTime() - Date.now();
      setCountdown(Math.max(0, Math.ceil(remainingMs / 1000)));
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [expiresAt]);

  const qrValue = qrToken && session
    ? JSON.stringify({
        sessionId: session.id,
        qrToken,
        expiresAt,
        latitude: session.latitude,
        longitude: session.longitude,
      })
    : '';

  if (!session) {
    return (
      <SessionLayout
        courseCode="Attendance"
        courseName="Session"
        section="Section"
        date=""
        onEndSession={() => navigate('/classes')}
      >
        <div className="mx-auto max-w-xl rounded-2xl border border-border/60 bg-card p-10 text-center shadow-card">
          <h1 className="text-2xl font-semibold">Session unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLoading ? 'Loading active session...' : 'This attendance session was not found or has already ended.'}
          </p>
          <Button className="mt-6" onClick={() => navigate('/classes')}>
            Back to Classes
          </Button>
        </div>
      </SessionLayout>
    );
  }

  return (
    <SessionLayout
      courseCode={session.course_code}
      courseName={session.course_name}
      section={session.section ? `Section ${session.section}` : "Section"}
      date={session.date}
      onEndSession={() => {
        if (!session) return;
        setIsEnding(true);
        void endSession(session.id)
          .then(() => navigate('/classes'))
          .finally(() => setIsEnding(false));
      }}
    >
      <div className="flex flex-col items-center space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">Live Attendance QR</h1>
          <p className="text-muted-foreground mt-2">Students can scan this code. It rotates every 5 seconds.</p>
        </div>

        <div className="w-full max-w-[18rem] rounded-2xl bg-white p-2 shadow-elevated sm:max-w-[21rem]">
          <div className="rounded-xl border border-border/30 bg-white p-4 sm:p-8">
            {qrValue ? (
              <QRCodeSVG value={qrValue} size={240} level="H" className="mx-auto h-auto w-full max-w-[240px]" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center text-sm text-muted-foreground">
                Generating QR...
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-sm space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <RefreshCw className={`h-4 w-4 ${countdown <= 2 ? 'animate-spin' : ''}`} />
              Refreshing in {countdown}s...
            </span>
            <span className="font-mono text-muted-foreground">Code #{qrToken.slice(0, 8) || '--------'}</span>
          </div>
          <Progress value={(countdown / 5) * 100} className="h-2" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            if (!session) return;
            void rotateSessionQr(session.id)
              .then((qr) => {
                setQrToken(qr.qrToken);
                setExpiresAt(qr.expiresAt);
                setCountdown(qr.refreshIntervalSeconds);
              })
              .catch((error) => {
                const message = error instanceof Error ? error.message : 'Unable to refresh QR code.';
                toast.error(message);
              });
          }}
          disabled={isRefreshingQr}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Force Refresh Now
        </Button>

        {isEnding && <p className="text-sm text-muted-foreground">Ending session...</p>}

        <Card className="w-full max-w-3xl overflow-hidden shadow-card">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-lg font-semibold">Live Attendance</h2>
                <p className="text-sm text-muted-foreground">Scans are pulled from the database every second.</p>
              </div>
              <Badge variant="outline" className="gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {sessionRecords.length} marked
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Student</TableHead>
                  <TableHead className="whitespace-nowrap">Student ID</TableHead>
                  <TableHead className="whitespace-nowrap">Time</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.student_name}</TableCell>
                    <TableCell>{record.student_id}</TableCell>
                    <TableCell>
                      {new Date(record.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="capitalize">{record.status}</TableCell>
                  </TableRow>
                ))}
                {sessionRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No students have scanned yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SessionLayout>
  );
}
