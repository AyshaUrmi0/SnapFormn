'use client';

import { Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function NotificationsTab() {
  return (
    <div className="space-y-4 py-6">
      <div>
        <h2 className="text-lg font-medium">Notifications</h2>
        <p className="text-sm text-muted-foreground">Manage your notification preferences.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <Bell className="h-8 w-8 text-muted-foreground/40" />
          <div>
            <p className="font-medium">Coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              Notification preferences will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
