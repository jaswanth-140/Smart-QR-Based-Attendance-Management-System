import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  variant?: 'default' | 'primary' | 'accent' | 'warning';
}

const variantClasses = {
  default: 'bg-card',
  primary: 'bg-primary/5',
  accent: 'bg-accent/10',
  warning: 'bg-warning/10',
};

const iconVariantClasses = {
  default: 'bg-secondary text-secondary-foreground',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <Card className={`${variantClasses[variant]} shadow-card border`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <p className={`text-xs font-medium ${trend.positive ? 'text-accent' : 'text-destructive'}`}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconVariantClasses[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
