'use client';

import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your Snapform account</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center">
          Login form will be implemented in Phase 02.
        </p>
      </CardContent>
    </Card>
  );
}
