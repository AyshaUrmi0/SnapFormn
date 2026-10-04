'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useGoogleLogin as useGoogleOAuth } from '@react-oauth/google';
import { Sparkles, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { listWorkspaces } from '@/modules/workspace/workspace.service';
import { useCreateForm, useUpdateFormFields } from '@/modules/form/form.queries';
import { login as loginFn, register as registerFn } from '@/modules/auth/auth.service';
import { useGoogleLogin } from '@/hooks/use-google-login';
import { clearGuestDraft } from '@/lib/guest-draft';
import { queryKeys } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import { env } from '@/lib/env';
import { getErrorMessage } from '@/lib/errors';
import type { EditorField } from './types';

interface GuestClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  fields: EditorField[];
}

export function GuestClaimDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
}: GuestClaimDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, setSession } = useAuth();
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();
  const createForm = useCreateForm();
  const updateFormFields = useUpdateFormFields();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');

  const googleLogin = useGoogleLogin();
  const googleOAuth = useGoogleOAuth({
    onSuccess: async (response) => {
      try {
        setIsSubmitting(true);
        const res = await googleLogin.mutateAsync(response.access_token);
        // Once session is restored, save the form
        await saveDraftToCloud();
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      toast.error('Google sign-in failed. Please try again.');
    },
  });

  async function saveDraftToCloud(targetWorkspaceId?: string) {
    // Determine workspace
    let wsId = targetWorkspaceId || selectedWorkspaceId;
    if (!wsId && workspaces && workspaces.length > 0) {
      wsId = workspaces[0].id;
    }
    if (!wsId) {
      try {
        const refreshedWorkspaces = await queryClient.fetchQuery({
          queryKey: queryKeys.workspaces.all(),
          queryFn: () => listWorkspaces(),
        });
        wsId = refreshedWorkspaces?.[0]?.id || '';
      } catch {
        // Fallback
      }
    }

    if (!wsId) {
      toast.error('Could not find or create a default workspace. Please try again.');
      return;
    }

    const suffix = crypto.randomUUID().slice(0, 6);
    const slugBase = (title || 'untitled-form')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${slugBase}-${suffix}`;

    const newForm = await createForm.mutateAsync({
      workspaceId: wsId,
      data: {
        title: title || 'Untitled Form',
        description: description || undefined,
        slug,
      },
    });

    await updateFormFields.mutateAsync({
      workspaceId: wsId,
      formId: newForm.id,
      fields: fields.map((f, idx) => ({
        type: f.type,
        label: f.label,
        description: f.description,
        placeholder: f.placeholder,
        required: f.required,
        order: idx,
        options: f.options,
        validations: f.validations,
        conditionals: f.conditionals,
      })),
    });

    clearGuestDraft();
    onOpenChange(false);
    toast.success('Your form has been saved to your workspace!');
    router.push(ROUTES.workspace(wsId).form(newForm.id).EDIT);
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const res = await registerFn({ email, password, name });
        setSession(res.accessToken);
      } else {
        const res = await loginFn({ email, password });
        setSession(res.accessToken);
      }

      await saveDraftToCloud();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const defaultWsId = selectedWorkspaceId || workspaces?.[0]?.id || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2 shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold">
            {isAuthenticated ? 'Save Form to Your Workspace' : 'Save Your Form & Start Collecting Responses'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isAuthenticated
              ? 'Select which workspace you want to save this form into.'
              : 'Sign in or create a free account. All your questions, layout, and logic rules will be automatically saved.'}
          </DialogDescription>
        </DialogHeader>

        {isAuthenticated ? (
          /* User already authenticated: simply choose workspace and save */
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Destination Workspace</Label>
              {isLoadingWorkspaces ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading workspaces...
                </div>
              ) : (
                <select
                  value={defaultWsId}
                  onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {workspaces?.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name} ({ws.plan})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Button
              onClick={() => saveDraftToCloud(defaultWsId)}
              disabled={isSubmitting || !defaultWsId}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Form...
                </>
              ) : (
                <>
                  Save to Workspace <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Visitor not authenticated: Show Google & Email signup/login */
          <div className="space-y-4 pt-1">
            {/* Google Sign In */}
            <Button
              variant="outline"
              type="button"
              className="w-full h-10"
              onClick={() => {
                if (!env.GOOGLE_CLIENT_ID) {
                  toast.error('Google sign-in is not configured. Please use email below.');
                  return;
                }
                googleOAuth();
              }}
              disabled={isSubmitting || googleLogin.isPending}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'register' && (
                <div className="space-y-1">
                  <Label className="text-xs">Your Name (optional)</Label>
                  <Input
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="h-9"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full mt-2 h-10">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Form...
                  </>
                ) : mode === 'register' ? (
                  'Create Free Account & Save Form'
                ) : (
                  'Log In & Save Form'
                )}
              </Button>
            </form>

            {/* Toggle Login / Register */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                {mode === 'register'
                  ? 'Already have an account? Log in'
                  : "Don't have an account? Sign up free"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
