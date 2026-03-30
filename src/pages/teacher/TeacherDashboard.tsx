import { TeacherTopNavbarLayout } from '@/components/layout/TeacherTopNavbarLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users, QrCode, Calendar, Activity, Layers3, Radio } from 'lucide-react';

const SESSION_TYPES: Record<string, { label: string; color: string }> = {
  'CS101': { label: 'Lecture', color: '' },
  'CS202': { label: 'Lab Session', color: 'text-primary' },
  'CS400': { label: 'Workshop', color: 'text-warning' },
};

const TIME_COLORS = ['text-primary', 'text-warning', 'text-accent'];

export default function TeacherDashboard() {
  const { sessions, courses, isLoading, error, clearError } = useAttendanceStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const liveSession = sessions.find((s) => s.qr_active);
  const sectionCount = new Set(courses.map((course) => course.section).filter(Boolean)).size;
  const liveCount = sessions.filter((session) => session.qr_active).length;
  const upcomingSessions = courses.slice(0, 3).map((course, index) => ({
    id: `${course.id}-${index}`,
    course_code: course.course_code,
    course_name: course.course_name,
    room: course.room,
    start_time: ["09:00", "11:00", "14:00"][index] ?? "09:00",
    end_time: ["10:30", "12:30", "15:30"][index] ?? "10:30",
  }));
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const nextClass = upcomingSessions[0];

  return (
    <TeacherTopNavbarLayout variant="hamburger">
      <div className="max-w-6xl space-y-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Today's Schedule</h1>
                <p className="mt-0.5 text-sm text-primary">{dateStr}</p>
              </div>
                <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  Even Semester 2026
                </Badge>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Card className="shadow-card border-primary/10">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Assigned Courses</p>
                    <Layers3 className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">{courses.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Loaded from your timetable</p>
                </CardContent>
              </Card>

              <Card className="shadow-card border-primary/10">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Sections Today</p>
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">{sectionCount || '--'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Across your active section schedule</p>
                </CardContent>
              </Card>

              <Card className="shadow-card border-primary/10">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Live Sessions</p>
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">{liveCount}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {liveCount > 0 ? 'Attendance is running now' : 'No attendance session is active'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="shadow-card border-primary/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Radio className="h-4 w-4" />
                {liveSession ? 'Session In Progress' : 'Next Teaching Slot'}
              </div>
              {liveSession ? (
                <div className="mt-4 space-y-3">
                  <Badge className="bg-primary text-primary-foreground">{liveSession.course_code}</Badge>
                  <div>
                    <p className="text-lg font-bold">{liveSession.course_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{liveSession.room}</p>
                  </div>
                  <Button className="w-full gap-2" onClick={() => navigate(`/session/${liveSession.id}`)}>
                    <QrCode className="h-4 w-4" />
                    Open Live Attendance
                  </Button>
                </div>
              ) : nextClass ? (
                <div className="mt-4 space-y-3">
                  <Badge variant="outline" className="border-primary/30 text-primary">{nextClass.course_code}</Badge>
                  <div>
                    <p className="text-lg font-bold">{nextClass.course_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{nextClass.room}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {nextClass.start_time} - {nextClass.end_time}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/classes')}>
                    Go To Classes
                  </Button>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-secondary/40 p-4 text-sm text-muted-foreground">
                  No classes are loaded yet for this teacher account.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading dashboard data...</p>}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>Dismiss</Button>
          </div>
        )}

        {liveSession && (
          <Card className="overflow-hidden border-2 border-primary/20 shadow-elevated">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Left: Image */}
                <div className="md:w-[360px] bg-secondary/30 relative overflow-hidden">
                  <div className="absolute inset-0 gradient-primary opacity-10" />
                  <div className="h-full min-h-[200px] flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-3">
                        <Users className="h-10 w-10 text-primary/40" />
                      </div>
                      <p className="text-xs text-muted-foreground">Classroom Session</p>
                    </div>
                  </div>
                </div>

                {/* Right: Info */}
                <div className="flex-1 p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">{liveSession.course_code}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {SESSION_TYPES[liveSession.course_code]?.label || 'Lecture'}
                      </span>
                    </div>
                    <Badge variant="outline" className="gap-1.5 bg-accent/10 text-accent border-accent/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                      </span>
                      LIVE NOW
                    </Badge>
                  </div>

                  <h2 className="text-2xl font-bold">{liveSession.course_name}</h2>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Section A</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {liveSession.room} (Science Block)</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {liveSession.start_time.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => {
                      const hr = parseInt(h);
                      return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
                    })} - {liveSession.end_time.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => {
                      const hr = parseInt(h);
                      return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
                    })}
                  </div>

                  <Button size="lg" className="gradient-primary mt-2 gap-2" onClick={() => navigate(`/session/${liveSession.id}`)}>
                    <QrCode className="h-4 w-4" />
                    Start Attendance Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!liveSession && (
          <Card className="border border-dashed border-border/70 bg-secondary/20 shadow-card">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-bold">No Live Attendance Session</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start attendance from your classes page when the section period begins. Students in that section
                  will then see the session automatically.
                </p>
              </div>
              <Button className="gap-2 self-start md:self-auto" onClick={() => navigate('/classes')}>
                <QrCode className="h-4 w-4" />
                Open Classes
              </Button>
            </CardContent>
          </Card>
        )}

        <div>
          <h3 className="text-xl font-bold mb-4">Upcoming Classes</h3>
          <div className="space-y-3">
            {upcomingSessions.map((session, index) => {
              const typeInfo = SESSION_TYPES[session.course_code];
              const timeColor = TIME_COLORS[index % TIME_COLORS.length];
              return (
                <Card key={session.id} className="shadow-card">
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className="text-center min-w-[70px]">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Start</p>
                      <p className={`text-2xl font-bold ${timeColor}`}>{session.start_time}</p>
                    </div>
                    <div className="h-14 w-px bg-border" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-primary border-primary/30 text-xs">{session.course_code}</Badge>
                        {typeInfo && <span className={`text-xs ${typeInfo.color || 'text-muted-foreground'}`}>{typeInfo.label}</span>}
                      </div>
                      <p className="font-semibold text-base">{session.course_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" /> {session.room}
                        <span>•</span>
                        <Clock className="h-3.5 w-3.5" />
                        {session.start_time.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => {
                          const hr = parseInt(h);
                          return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
                        })} - {session.end_time.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => {
                          const hr = parseInt(h);
                          return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
                        })}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/classes')}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {!isLoading && upcomingSessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
            )}
          </div>
        </div>
      </div>
    </TeacherTopNavbarLayout>
  );
}
