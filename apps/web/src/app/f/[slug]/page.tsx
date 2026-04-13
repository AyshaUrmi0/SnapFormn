'use client';

import { use, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { useFormBySlug } from '@/modules/form/form.queries';
import { useSubmitForm } from '@/modules/submission/submission.queries';
import { FormRenderer } from '@/features/public-form/form-renderer';
import { ROUTES } from '@/constants/routes';
import { DEFAULT_SHARE_CONFIG, type FormSettings } from '@/modules/form/settings-types';

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbedded = searchParams.get('embedded') === 'true';

  const { data: form, isLoading, isError, error, refetch } = useFormBySlug(slug);
  const submitForm = useSubmitForm();

  const [passwordInput, setPasswordInput] = useState('');
  const [passwordUnlocked, setPasswordUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const settings = (form?.settings ?? {}) as FormSettings;
  const shareConfig = { ...DEFAULT_SHARE_CONFIG, ...settings.share };
  const needsPassword = shareConfig.passwordEnabled && shareConfig.password && !passwordUnlocked;

  if (isLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isEmbedded ? '' : 'bg-muted/30'}`}>
        <LoadingState message="Loading form..." />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isEmbedded ? '' : 'bg-muted/30'}`}>
        <ErrorState
          message={error?.message ?? 'This form is not available'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Password gate
  if (needsPassword) {
    return (
      <div className={`min-h-screen flex items-center justify-center py-12 px-4 ${isEmbedded ? '' : 'bg-muted/30'}`}>
        <div className="max-w-sm mx-auto w-full">
          <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-sm space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-3">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold">{form.title}</h1>
              <p className="text-sm text-muted-foreground">This form is password protected.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (passwordInput === shareConfig.password) {
                  setPasswordUnlocked(true);
                  setPasswordError('');
                } else {
                  setPasswordError('Incorrect password');
                }
              }}
              className="space-y-3"
            >
              <Input
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput((e.target as HTMLInputElement).value); setPasswordError(''); }}
                className={passwordError ? 'border-destructive' : ''}
              />
              {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
              <Button type="submit" className="w-full">
                Access form
              </Button>
            </form>
          </div>
        </div>
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
          // Check for redirect URL in settings
          const successRedirect = (settings.successPage?.redirectUrl ?? '').trim();
          if (successRedirect) {
            if (isEmbedded) {
              // In iframe, redirect the iframe itself
              window.location.href = successRedirect;
            } else {
              window.location.href = successRedirect;
            }
          } else {
            router.push(`${ROUTES.publicFormSuccess(slug)}${isEmbedded ? '?embedded=true' : ''}`);
          }
        },
      },
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 ${isEmbedded ? '' : 'bg-muted/30'}`}>
      <div className="max-w-xl mx-auto">
        <div className={`rounded-xl border bg-card p-6 sm:p-8 shadow-sm ${isEmbedded ? 'border-0 shadow-none' : ''}`}>
          <FormRenderer
            title={form.title}
            description={form.description}
            slug={form.slug}
            fields={form.fields ?? []}
            isSubmitting={submitForm.isPending}
            onSubmit={handleSubmit}
          />
        </div>

        {!isEmbedded && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Powered by <span className="font-medium">Snapform</span>
          </p>
        )}
      </div>
    </div>
  );
}
