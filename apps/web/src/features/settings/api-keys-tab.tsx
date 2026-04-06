'use client';

import { Key } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ApiKeysTab() {
  return (
    <div className="space-y-4 py-6">
      <div>
        <h2 className="text-lg font-medium">API Keys</h2>
        <p className="text-sm text-muted-foreground">Manage API keys for programmatic access.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <Key className="h-8 w-8 text-muted-foreground/40" />
          <div>
            <p className="font-medium">Coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              API key management will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
