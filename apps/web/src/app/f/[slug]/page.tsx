'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { useFormBySlug } from '@/modules/form/form.queries';
import { useSubmitForm } from '@/modules/submission/submission.queries';
import { FormRenderer } from '@/features/public-form/form-renderer';
import { ROUTES } from '@/constants/routes';

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: form, isLoading, isError, error, refetch } = useFormBySlug(slug);
  const submitForm = useSubmitForm();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <LoadingState message="Loading form..." />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <ErrorState
          message={error?.message ?? 'This form is not available'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  function handleSubmit(values: Record<string, unknown>) {
    const fields = Object.entries(values).map(([fieldId, value]) => ({
      fieldId,
      value,
    }));

    submitForm.mutate(
      { slug, data: { fields } },
      {
        onSuccess: () => {
          router.push(ROUTES.publicFormSuccess(slug));
        },
      },
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-sm">
          <FormRenderer
            title={form.title}
            description={form.description}
            fields={form.fields ?? []}
            isSubmitting={submitForm.isPending}
            onSubmit={handleSubmit}
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by <span className="font-medium">Snapform</span>
        </p>
      </div>
    </div>
  );
}
