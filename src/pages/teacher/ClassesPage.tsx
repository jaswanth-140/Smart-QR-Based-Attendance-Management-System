import { TeacherTopNavbarLayout } from '@/components/layout/TeacherTopNavbarLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttendanceStore } from '@/store/attendanceStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBrowserCoordinates } from '@/lib/geolocation';
import { Clock, MapPin, Users, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ClassesPage() {
  const fallbackCoordinates = { latitude: 17.385, longitude: 78.4867 };
  const { courses, sessions, createSession, isLoading, error, clearError } = useAttendanceStore();
  const navigate = useNavigate();
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  const handleTakeAttendance = async (courseId: string) => {
    const existingSession = sessions.find((session) => session.course_id === courseId && session.qr_active);
    if (existingSession) {
      navigate(`/session/${existingSession.id}`);
      return;
    }

    setLoadingCourseId(courseId);
    try {
      let coordinates = fallbackCoordinates;
      try {
        coordinates = await getBrowserCoordinates(8000);
      } catch {
        toast.warning('Location unavailable on this browser/network. Starting attendance with fallback location.');
      }
      const session = await createSession(courseId, coordinates.latitude, coordinates.longitude);
      navigate(`/session/${session.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start attendance session.';
      toast.error(message);
    } finally {
      setLoadingCourseId(null);
    }
  };

  return (
    <TeacherTopNavbarLayout>
      <div className="space-y-6 max-w-6xl">
        <h1 className="text-3xl font-extrabold tracking-tight">My Classes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-sm text-muted-foreground col-span-full">Loading classes...</p>}
        {error && (
          <div className="col-span-full rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <button className="text-sm text-destructive underline" onClick={clearError}>Dismiss</button>
          </div>
        )}
        {courses.map((course) => (
          <Card key={course.id} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{course.course_code}</Badge>
                    {course.section && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Section {course.section}</Badge>}
                  </div>
                  <CardTitle className="text-base">{course.course_name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {course.schedule}</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {course.room}</p>
                <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> {course.teacher_name}</p>
              </div>
              <Button
                className="mt-4 w-full gap-2"
                onClick={() => void handleTakeAttendance(course.id)}
                disabled={loadingCourseId === course.id}
              >
                <QrCode className="h-4 w-4" />
                {loadingCourseId === course.id ? 'Starting...' : 'Take Attendance'}
              </Button>
            </CardContent>
          </Card>
        ))}
        {!isLoading && courses.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">No courses found.</p>
        )}
        </div>
      </div>
    </TeacherTopNavbarLayout>
  );
}
