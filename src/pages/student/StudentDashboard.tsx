import { TopNavbarLayout } from '@/components/layout/TopNavbarLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useAuthStore } from '@/store/authStore';
import {
  TrendingUp, GraduationCap, Flame, CheckCircle, QrCode,
  Smartphone as PhoneIcon, Tablet, Laptop, Clock, MapPin, Users, Monitor,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MAX_DEVICE_SLOTS } from '@/lib/deviceSlots';

const recentActivity = [
  { icon: CheckCircle, text: 'Attendance history synced', time: 'Latest data', highlight: true },
  { icon: PhoneIcon, text: 'Device access ready', subtitle: 'Use Scan QR when a teacher starts attendance.', time: '', highlight: false },
  { icon: QrCode, text: 'Live QR scans appear here during class', time: 'When a session is active', highlight: false },
];

const deviceIcons: Record<string, React.ElementType> = {
  'iPhone 15 Pro': PhoneIcon,
  'MacBook Pro': Laptop,
  'iPad Air': Tablet,
};

function describeSchedule(schedule: string): string {
  const normalized = schedule.trim();
  if (!normalized) return 'Timetable slot to be assigned';
  if (normalized.toLowerCase().includes('section')) return 'Regular section timetable';
  return normalized;
}

function getScheduleBadge(schedule: string): string {
  const normalized = schedule.toLowerCase();
  if (normalized.includes('tuesday')) return 'Tuesday';
  if (normalized.includes('wednesday')) return 'Wednesday';
  return 'Section';
}

function shouldShowTomorrow(schedule: string, tomorrowName: string): boolean {
  const normalized = schedule.toLowerCase();
  const tomorrow = tomorrowName.toLowerCase();

  if (normalized.includes('tuesday') || normalized.includes('wednesday')) {
    return normalized.includes(tomorrow);
  }

  return true;
}

export default function StudentDashboard() {
  const { courses, studentSummaries, sessions, isLoading, error, clearError } = useAttendanceStore();
  const { user, devices } = useAuthStore();
  const navigate = useNavigate();

  const overallPercentage = studentSummaries.length
    ? Math.round(studentSummaries.reduce((a, s) => a + s.percentage, 0) / studentSummaries.length)
    : 0;
  const totalAttended = studentSummaries.reduce((a, s) => a + s.attended, 0);
  const totalSessions = studentSummaries.reduce((a, s) => a + s.total_sessions, 0);
  const sectionLabel = courses[0]?.section || user?.department || 'CSE';
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowName = tomorrowDate.toLocaleDateString([], { weekday: 'long' });
  const tomorrowLabel = tomorrowDate.toLocaleDateString([], { day: '2-digit', month: 'short' });
  const tomorrowCards = courses
    .slice()
    .sort((left, right) => left.course_code.localeCompare(right.course_code))
    .filter((course) => shouldShowTomorrow(course.schedule, tomorrowName))
    .map((course) => ({
      id: course.id,
      code: course.course_code,
      name: course.course_name,
      professor: course.teacher_name,
      room: course.room,
      schedule: describeSchedule(course.schedule),
      badge: getScheduleBadge(course.schedule),
    }))
    .slice(0, 4);

  const now = new Date();
  const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const liveSession = sessions.find((session) => session.qr_active);
  const deviceSlotsUsed = devices.length;
  const deviceSlotsPercent = Math.min(100, (deviceSlotsUsed / MAX_DEVICE_SLOTS) * 100);
  const remainingDeviceSlots = Math.max(0, MAX_DEVICE_SLOTS - deviceSlotsUsed);

  return (
    <TopNavbarLayout>
      <div className="space-y-8 max-w-6xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}. Your {sectionLabel} section courses are loaded below.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-primary">Current Time</p>
            <p className="text-2xl font-bold">{currentTime}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-primary">Overall Attendance</p>
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-4xl font-bold">{overallPercentage}%</span>
                <Badge className="bg-accent/15 text-accent border-accent/30 mb-1" variant="outline">
                  Current
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Target: &gt;85% required</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-primary">Classes Attended</p>
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-3">
                <span className="text-4xl font-bold">{totalAttended}</span>
                <span className="text-xl text-muted-foreground">/{totalSessions}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Attendance sessions recorded</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-primary">Courses Loaded</p>
                <Flame className="h-5 w-5 text-warning" />
              </div>
              <div className="mt-3">
                <span className="text-4xl font-bold">{courses.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{sectionLabel} section subjects</p>
            </CardContent>
          </Card>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading attendance data...</p>}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>Dismiss</Button>
          </div>
        )}

        {liveSession && (
          <Card className="shadow-elevated border-2 border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 px-5 py-2 bg-destructive/5 border-b border-destructive/10">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                </span>
                <span className="text-sm font-semibold text-destructive uppercase tracking-wide">Live Now</span>
                <span className="ml-auto text-sm text-muted-foreground">{liveSession.section}</span>
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6 space-y-3">
                  <h3 className="text-2xl font-bold">{liveSession.course_code} - {liveSession.course_name}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {liveSession.start_time} - {liveSession.end_time}</span>
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Live Session</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {liveSession.room}</span>
                  </div>
                  <Button size="lg" className="gradient-primary mt-2 gap-2" onClick={() => navigate('/scan')}>
                    <QrCode className="h-4 w-4" />
                    Mark Attendance
                  </Button>
                </div>
                <div className="hidden md:block w-64 bg-foreground/5 relative overflow-hidden">
                  <div className="absolute inset-0 gradient-primary opacity-10" />
                  <div className="h-full flex items-center justify-center p-4">
                    <div className="text-center">
                      <Monitor className="h-12 w-12 text-primary/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground font-medium">Session is active now</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-xl font-bold">Tomorrow&apos;s Timetable</h2>
              <p className="text-sm text-muted-foreground mt-1">{tomorrowName}, {tomorrowLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/20 text-primary">
                {sectionLabel}
              </Badge>
              <Badge variant="secondary">
                {tomorrowCards.length} classes
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {tomorrowCards.map((course) => (
              <Card key={course.id} className="shadow-card border-primary/10">
                <CardContent className="p-0">
                  <div className="flex h-full">
                    <div className="w-1.5 bg-primary rounded-l-xl" />
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-primary">{course.badge}</p>
                          <h3 className="text-lg font-bold mt-1">{course.code}</h3>
                        </div>
                        <Badge variant="outline" className="border-primary/20 text-primary">
                          {sectionLabel}
                        </Badge>
                      </div>
                      <p className="font-medium mt-3">{course.name}</p>
                      <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                        <p>{course.professor}</p>
                        <p>{course.room}</p>
                        <p>{course.schedule}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!isLoading && tomorrowCards.length === 0 && (
              <Card className="shadow-card">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No timetable entries are available for tomorrow yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-bold">Device Status</h3>
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold">{deviceSlotsUsed}</span>
                  <span className="text-xl text-muted-foreground">/{MAX_DEVICE_SLOTS}</span>
                  <span className="text-sm text-primary ml-auto">Devices Registered</span>
                </div>
                <Progress value={deviceSlotsPercent} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  You can register {remainingDeviceSlots} more device{remainingDeviceSlots === 1 ? '' : 's'}.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Registered Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.slice(0, 3).map((device) => {
                    const Icon = deviceIcons[device.device_name] || PhoneIcon;
                    const lastActive = device.last_active
                      ? (() => {
                        const diff = Date.now() - new Date(device.last_active).getTime();
                        const hours = Math.floor(diff / 3600000);
                        if (hours < 24) return `Last active: ${hours}h ago`;
                        return 'Last active: Yesterday';
                      })()
                      : '';
                    return (
                      <div key={device.id} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{device.device_name}</p>
                          <p className="text-xs text-muted-foreground">{lastActive}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="link" className="mt-3 px-0 text-primary" onClick={() => navigate('/settings')}>
                  Manage Devices
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`mt-0.5 h-3 w-3 rounded-full shrink-0 ${item.highlight ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                    <div>
                      <p className="text-sm font-semibold">{item.text}</p>
                      {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                      {item.time && <p className="text-xs text-muted-foreground">{item.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TopNavbarLayout>
  );
}
