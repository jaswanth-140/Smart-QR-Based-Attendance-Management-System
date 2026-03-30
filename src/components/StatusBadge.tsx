import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Clock, MinusCircle } from 'lucide-react';
import type { AttendanceStatus, ConfidenceLevel } from '@/store/attendanceStore';

const statusConfig: Record<AttendanceStatus, { label: string; className: string; icon: React.ElementType }> = {
  present: {
    label: 'Present',
    className: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/10',
    icon: CheckCircle2,
  },
  absent: {
    label: 'Absent',
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10',
    icon: XCircle,
  },
  late: {
    label: 'Late',
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/10',
    icon: Clock,
  },
  review: {
    label: 'Review Needed',
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/10',
    icon: AlertTriangle,
  },
  excused: {
    label: 'Excused',
    className: 'bg-secondary text-muted-foreground border-border hover:bg-secondary',
    icon: MinusCircle,
  },
};

interface StatusBadgeProps {
  status: AttendanceStatus;
  showIcon?: boolean;
  label?: string;
}

export function StatusBadge({ status, showIcon = true, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label || config.label}
    </Badge>
  );
}

const confidenceConfig: Record<ConfidenceLevel, { label: string; className: string; icon: React.ElementType }> = {
  high: {
    label: 'Present (High Conf.)',
    className: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/10',
    icon: CheckCircle2,
  },
  review: {
    label: 'Review Needed',
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/10',
    icon: AlertTriangle,
  },
  rejected: {
    label: 'Absent',
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10',
    icon: XCircle,
  },
};

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const config = confidenceConfig[confidence];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1.5 ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

interface ExcusedBadgeProps {
  className?: string;
}

export function ExcusedBadge({ className }: ExcusedBadgeProps) {
  return (
    <Badge variant="outline" className={`gap-1 bg-secondary text-muted-foreground border-border hover:bg-secondary ${className || ''}`}>
      <MinusCircle className="h-3 w-3" />
      Excused
    </Badge>
  );
}
