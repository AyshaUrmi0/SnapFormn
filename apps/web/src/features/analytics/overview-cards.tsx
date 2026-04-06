'use client';

import { BarChart3, CheckCircle, Percent, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/date-utils';
import type { FormAnalytics } from '@/modules/submission/types';

interface OverviewCardsProps {
  overview: FormAnalytics['overview'];
}

const stats = [
  {
    key: 'total',
    label: 'Total Submissions',
    icon: BarChart3,
    getValue: (o: FormAnalytics['overview']) => o.totalSubmissions.toString(),
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle,
    getValue: (o: FormAnalytics['overview']) => o.completedSubmissions.toString(),
  },
  {
    key: 'rate',
    label: 'Completion Rate',
    icon: Percent,
    getValue: (o: FormAnalytics['overview']) => `${o.completionRate}%`,
  },
  {
    key: 'last',
    label: 'Last Submission',
    icon: Clock,
    getValue: (o: FormAnalytics['overview']) =>
      o.lastSubmissionAt ? formatRelativeTime(o.lastSubmissionAt) : 'None',
  },
] as const;

export function OverviewCards({ overview }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.key}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.getValue(overview)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
