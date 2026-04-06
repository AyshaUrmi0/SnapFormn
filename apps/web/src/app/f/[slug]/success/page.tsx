'use client';

import { use } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function FormSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="rounded-xl border bg-card p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Thank you!</h1>
            <p className="text-muted-foreground">
              Your response has been submitted successfully.
            </p>
          </div>

          <Link href={ROUTES.publicForm(slug)}>
            <Button variant="outline" className="mt-2">
              Submit another response
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-medium">Snapform</span>
        </p>
      </div>
    </div>
  );
}
