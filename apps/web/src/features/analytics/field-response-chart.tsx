'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormAnalytics } from '@/modules/submission/types';

interface FieldResponseChartProps {
  data: FormAnalytics['fieldStats'];
}

function truncateLabel(label: string, maxLen = 15): string {
  return label.length > maxLen ? `${label.slice(0, maxLen)}...` : label;
}

export function FieldResponseChart({ data }: FieldResponseChartProps) {
  // Filter out layout fields (STATEMENT, PAGE_BREAK)
  const fields = data.filter((f) => f.type !== 'STATEMENT' && f.type !== 'PAGE_BREAK');

  if (fields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field Response Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No field data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = fields.map((f) => ({
    label: truncateLabel(f.label || 'Untitled'),
    fullLabel: f.label,
    responseRate: f.responseRate,
    responseCount: f.responseCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Field Response Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(280, fields.length * 36)}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: any) => [`${value}%`, 'Response Rate']}
              labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullLabel ?? label}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Bar
              dataKey="responseRate"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
