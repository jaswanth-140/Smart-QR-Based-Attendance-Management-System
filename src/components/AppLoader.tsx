import { QrCode } from "lucide-react";

interface AppLoaderProps {
  message?: string;
  compact?: boolean;
}

export function AppLoader({
  message = "Loading workspace...",
  compact = false,
}: AppLoaderProps) {
  return (
    <div className="min-h-screen bg-background">
      <div
        className={`mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 ${
          compact ? "py-16" : "py-24"
        }`}
      >
        <div className="relative overflow-hidden rounded-[28px] border border-border/70 bg-card/95 px-10 py-12 text-center shadow-elevated backdrop-blur">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <QrCode className="h-8 w-8" />
          </div>
          <div className="mx-auto mb-5 flex w-fit items-center gap-3 rounded-full border border-border/60 bg-secondary/60 px-4 py-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Smart Attendance Hub
            </span>
          </div>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-primary/25 border-t-primary" />
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Preparing your dashboards, devices, and attendance data.
          </p>
        </div>
      </div>
    </div>
  );
}
