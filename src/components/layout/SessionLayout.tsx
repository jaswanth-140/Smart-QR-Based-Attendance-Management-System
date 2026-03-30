import { useAuthStore } from '@/store/authStore';
import { QrCode, StopCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SessionLayoutProps {
  children: React.ReactNode;
  courseCode?: string;
  courseName?: string;
  section?: string;
  date?: string;
  onEndSession?: () => void;
}

interface MobileScanLayoutProps {
  children: React.ReactNode;
}

export function SessionLayout({ children, courseCode, courseName, section, date, onEndSession }: SessionLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white border-b border-border/60 shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-3 py-3 sm:px-6 sm:py-0 md:h-14 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <QrCode className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">
                {courseCode} - {courseName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {section} - {date}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <Badge variant="outline" className="gap-1.5 bg-accent/10 text-accent border-accent/30 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              LIVE SESSION
            </Badge>
            {onEndSession && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEndSession}
                className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <StopCircle className="h-4 w-4" />
                End Session
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="safe-bottom mx-auto max-w-3xl px-3 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}

export function MobileScanLayout({ children }: MobileScanLayoutProps) {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white border-b border-border/60 shadow-sm sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:h-16 sm:px-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <span className="text-base font-bold text-foreground sm:text-lg">Smart Attendance</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {user?.name?.charAt(0) || 'S'}
          </div>
        </div>
      </header>

      <main className="safe-bottom mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-3 py-5 sm:px-5 sm:py-8 md:px-8 md:py-12">
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
