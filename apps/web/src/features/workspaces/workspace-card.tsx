'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import type { WorkspaceWithRole } from '@/modules/workspace/types';

const PLAN_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  FREE: 'secondary',
  PRO: 'default',
  BUSINESS: 'default',
};

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  OWNER: 'default',
  ADMIN: 'secondary',
  EDITOR: 'outline',
  VIEWER: 'outline',
};

interface WorkspaceCardProps {
  workspace: WorkspaceWithRole;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link href={ROUTES.workspace(workspace.id).FORMS}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{workspace.name}</CardTitle>
          <p className="text-sm text-muted-foreground">/{workspace.slug}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={PLAN_VARIANT[workspace.plan] ?? 'secondary'}>
              {workspace.plan}
            </Badge>
            <Badge variant={ROLE_VARIANT[workspace.role] ?? 'outline'}>
              {workspace.role}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
