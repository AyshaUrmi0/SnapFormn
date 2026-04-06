'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useForm as useFormQuery, useUpdateForm } from '@/modules/form/form.queries';
import { ROUTES } from '@/constants/routes';
import {
  DEFAULT_SUCCESS_CONFIG,
  DEFAULT_SHARE_CONFIG,
  DEFAULT_EMBED_CONFIG,
  type FormSettings,
  type FormSuccessConfig,
  type FormShareConfig,
  type FormEmbedConfig,
} from '@/modules/form/settings-types';

export default function FormSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; formId: string }>;
}) {
  const { workspaceId, formId } = use(params);
  const { workspace } = useWorkspaceContext();
  const { data: form, isLoading, isError, error, refetch } = useFormQuery(workspaceId, formId);
  const updateForm = useUpdateForm();

  const [successConfig, setSuccessConfig] = useState<FormSuccessConfig>(DEFAULT_SUCCESS_CONFIG);
  const [shareConfig, setShareConfig] = useState<FormShareConfig>(DEFAULT_SHARE_CONFIG);
  const [embedConfig, setEmbedConfig] = useState<FormEmbedConfig>(DEFAULT_EMBED_CONFIG);
  const [isDirty, setIsDirty] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (form) {
      const settings = (form.settings ?? {}) as FormSettings;
      setSuccessConfig({ ...DEFAULT_SUCCESS_CONFIG, ...settings.successPage });
      setShareConfig({ ...DEFAULT_SHARE_CONFIG, ...settings.share });
      setEmbedConfig({ ...DEFAULT_EMBED_CONFIG, ...settings.embed });
    }
  }, [form]);

  function handleSave() {
    const settings: FormSettings = {
      successPage: successConfig,
      share: shareConfig,
      embed: embedConfig,
    };
    updateForm.mutate(
      { workspaceId, formId, data: { settings } },
      { onSuccess: () => setIsDirty(false) },
    );
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingState message="Loading settings..." />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ErrorState message={error?.message ?? 'Form not found'} onRetry={() => refetch()} />
      </div>
    );
  }

  const formUrl = typeof window !== 'undefined' ? `${window.location.origin}/f/${form.slug}` : '';
  const embedCode = `<iframe src="${formUrl}?embedded=true" width="100%" height="${embedConfig.embedHeight}" frameborder="0" style="border:none;"></iframe>`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.workspace(workspaceId).form(formId).EDIT}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">{form.title} — Settings</h1>
        </div>
        <Button size="sm" onClick={handleSave} disabled={!isDirty || updateForm.isPending}>
          {updateForm.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      {/* Share Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Share Link</CardTitle>
          <CardDescription>Share this link with your audience to collect responses.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={formUrl} readOnly className="flex-1 text-sm" onFocus={(e) => (e.target as HTMLInputElement).select()} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(formUrl, 'Link')}
              className="shrink-0"
            >
              {copied === 'Link' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Thank You Page */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thank You Page</CardTitle>
          <CardDescription>Customize what respondents see after submitting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="success-message">Success message</Label>
            <Input
              id="success-message"
              value={successConfig.message}
              onChange={(e) => {
                setSuccessConfig((prev) => ({ ...prev, message: (e.target as HTMLInputElement).value }));
                setIsDirty(true);
              }}
              placeholder="Thank you! Your response has been submitted."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-submit-another">Show "Submit another response" button</Label>
            <Switch
              id="show-submit-another"
              checked={successConfig.showSubmitAnother}
              onCheckedChange={(checked) => {
                setSuccessConfig((prev) => ({ ...prev, showSubmitAnother: checked }));
                setIsDirty(true);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="redirect-url">Redirect URL (optional)</Label>
            <Input
              id="redirect-url"
              value={successConfig.redirectUrl}
              onChange={(e) => {
                setSuccessConfig((prev) => ({ ...prev, redirectUrl: (e.target as HTMLInputElement).value }));
                setIsDirty(true);
              }}
              placeholder="https://example.com/thank-you"
            />
            <p className="text-xs text-muted-foreground">
              If set, respondents will be redirected here instead of the thank you page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password Protection</CardTitle>
          <CardDescription>Require a password to access the form.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="password-enabled">Enable password</Label>
            <Switch
              id="password-enabled"
              checked={shareConfig.passwordEnabled}
              onCheckedChange={(checked) => {
                setShareConfig((prev) => ({ ...prev, passwordEnabled: checked }));
                setIsDirty(true);
              }}
            />
          </div>

          {shareConfig.passwordEnabled && (
            <div className="space-y-1.5">
              <Label htmlFor="form-password">Password</Label>
              <Input
                id="form-password"
                type="text"
                value={shareConfig.password}
                onChange={(e) => {
                  setShareConfig((prev) => ({ ...prev, password: (e.target as HTMLInputElement).value }));
                  setIsDirty(true);
                }}
                placeholder="Enter a password"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="closed-message">Closed form message</Label>
            <Input
              id="closed-message"
              value={shareConfig.closedMessage}
              onChange={(e) => {
                setShareConfig((prev) => ({ ...prev, closedMessage: (e.target as HTMLInputElement).value }));
                setIsDirty(true);
              }}
              placeholder="This form is no longer accepting responses."
            />
            <p className="text-xs text-muted-foreground">
              Shown when the form status is set to Closed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Embedding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Embed</CardTitle>
          <CardDescription>Embed this form on your website using an iframe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-embed">Allow embedding</Label>
            <Switch
              id="allow-embed"
              checked={embedConfig.allowEmbed}
              onCheckedChange={(checked) => {
                setEmbedConfig((prev) => ({ ...prev, allowEmbed: checked }));
                setIsDirty(true);
              }}
            />
          </div>

          {embedConfig.allowEmbed && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="embed-height">Height (px)</Label>
                <Input
                  id="embed-height"
                  type="number"
                  value={embedConfig.embedHeight}
                  onChange={(e) => {
                    setEmbedConfig((prev) => ({ ...prev, embedHeight: Number((e.target as HTMLInputElement).value) || 600 }));
                    setIsDirty(true);
                  }}
                  min={300}
                  max={2000}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Embed code</Label>
                <div className="relative">
                  <pre className="rounded-md border bg-muted/50 p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {embedCode}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 h-7 text-xs"
                    onClick={() => copyToClipboard(embedCode, 'Embed code')}
                  >
                    {copied === 'Embed code' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
