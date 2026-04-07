'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useModal } from '@/providers/modal-provider';
import { useUpdateProfile, useDeleteAccount, useChangePassword, useRequestEmailChange, useVerifyEmailChange } from '@/modules/user/user.queries';
import {
  changePasswordSchema, type ChangePasswordValues,
  changeEmailSchema, type ChangeEmailValues,
  verifyEmailChangeSchema, type VerifyEmailChangeValues,
} from '@/modules/auth/schemas';
import { ROUTES } from '@/constants/routes';

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return email[0].toUpperCase();
}

interface ProfileFormValues {
  firstName: string;
  lastName: string;
}

export function MyAccountTab() {
  const router = useRouter();
  const { user, clearSession, refreshUser } = useAuth();
  const { confirm } = useModal();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const changePassword = useChangePassword();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  function onPasswordSubmit(values: ChangePasswordValues) {
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          setShowPasswordForm(false);
          passwordForm.reset();
        },
      },
    );
  }

  const requestEmailChange = useRequestEmailChange();
  const verifyEmailChange = useVerifyEmailChange();
  const [emailChangeStep, setEmailChangeStep] = useState<'idle' | 'request' | 'verify'>('idle');
  const [changeToken, setChangeToken] = useState('');

  const emailForm = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: '', password: '' },
  });

  const verifyEmailForm = useForm<VerifyEmailChangeValues>({
    resolver: zodResolver(verifyEmailChangeSchema),
    defaultValues: { code: '' },
  });

  function onEmailChangeRequest(values: ChangeEmailValues) {
    requestEmailChange.mutate(values, {
      onSuccess: (res) => {
        setChangeToken(res.changeToken);
        setEmailChangeStep('verify');
      },
    });
  }

  function onEmailChangeVerify(values: VerifyEmailChangeValues) {
    verifyEmailChange.mutate(
      { changeToken, code: values.code },
      {
        onSuccess: () => {
          setEmailChangeStep('idle');
          emailForm.reset();
          verifyEmailForm.reset();
          refreshUser();
        },
      },
    );
  }

  const nameParts = (user?.name ?? '').split(' ');
  const defaultFirst = nameParts[0] ?? '';
  const defaultLast = nameParts.slice(1).join(' ') ?? '';

  const form = useForm<ProfileFormValues>({
    defaultValues: { firstName: defaultFirst, lastName: defaultLast },
  });

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(' ');
      form.reset({ firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') ?? '' });
    }
  }, [user?.name, form]);

  function onSubmit(values: ProfileFormValues) {
    const name = `${values.firstName} ${values.lastName}`.trim();
    updateProfile.mutate({ name }, {
      onSuccess: () => refreshUser(),
    });
  }

  async function handleDeleteAccount() {
    const confirmed = await confirm({
      title: 'Delete account',
      description: 'Are you sure you want to permanently delete your account? This will remove all your data, workspaces, and forms. This action cannot be undone.',
      confirmLabel: 'Delete my account',
      variant: 'destructive',
    });
    if (confirmed) {
      deleteAccount.mutate(undefined, {
        onSuccess: () => {
          clearSession();
          router.push(ROUTES.LOGIN);
        },
      });
    }
  }

  function comingSoon() {
    toast.info('Coming soon');
  }

  if (!user) return null;

  return (
    <div className="space-y-8 py-6">
      {/* Photo */}
      <div className="space-y-2">
        <Label>Photo</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name ?? 'Avatar'} />}
            <AvatarFallback className="text-lg">
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.name ?? user.email}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Name */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...form.register('firstName')} placeholder="First name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...form.register('lastName')} placeholder="Last name" />
          </div>
        </div>

        <Separator />

        {/* Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Email</Label>
            {emailChangeStep === 'idle' && (
              <button
                type="button"
                onClick={() => setEmailChangeStep('request')}
                className="text-xs text-primary hover:underline"
              >
                Change email
              </button>
            )}
            {emailChangeStep !== 'idle' && (
              <button
                type="button"
                onClick={() => { setEmailChangeStep('idle'); emailForm.reset(); verifyEmailForm.reset(); }}
                className="text-xs text-primary hover:underline"
              >
                Cancel
              </button>
            )}
          </div>
          <Input id="email" value={user.email} readOnly className="bg-muted/50" />
          {emailChangeStep === 'request' && (
            <div className="space-y-3 rounded-md border p-4 mt-2">
              <p className="text-xs text-muted-foreground">
                Enter your new email and current password. We&apos;ll send a verification code to the new email.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="newEmail">New email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="new@example.com"
                  autoComplete="email"
                  {...emailForm.register('newEmail')}
                />
                {emailForm.formState.errors.newEmail && (
                  <p className="text-xs text-destructive">{emailForm.formState.errors.newEmail.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emailPassword">Password</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...emailForm.register('password')}
                />
                {emailForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{emailForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={emailForm.handleSubmit(onEmailChangeRequest)}
                disabled={requestEmailChange.isPending}
              >
                {requestEmailChange.isPending ? 'Sending...' : 'Send verification code'}
              </Button>
            </div>
          )}
          {emailChangeStep === 'verify' && (
            <div className="space-y-3 rounded-md border p-4 mt-2">
              <p className="text-xs text-muted-foreground">
                We sent a 6-digit code to your new email. Enter it below to confirm the change.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="emailCode">Verification code</Label>
                <Input
                  id="emailCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  {...verifyEmailForm.register('code')}
                />
                {verifyEmailForm.formState.errors.code && (
                  <p className="text-xs text-destructive">{verifyEmailForm.formState.errors.code.message}</p>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={verifyEmailForm.handleSubmit(onEmailChangeVerify)}
                disabled={verifyEmailChange.isPending}
              >
                {verifyEmailChange.isPending ? 'Verifying...' : 'Verify and change email'}
              </Button>
            </div>
          )}
        </div>

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Updating...' : 'Update'}
        </Button>
      </form>

      <Separator />

      {/* Password */}
      <div className="space-y-3">
        <Label>Password</Label>
        <Card>
          <CardContent className="py-4">
            {showPasswordForm ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Change your password</p>
                  <p className="text-xs text-muted-foreground">
                    Enter your current password and choose a new one.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      {...passwordForm.register('currentPassword')}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="newPassword">New password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        {...passwordForm.register('newPassword')}
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        {...passwordForm.register('confirmPassword')}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={passwordForm.handleSubmit(onPasswordSubmit)}
                    disabled={changePassword.isPending}
                  >
                    {changePassword.isPending ? 'Saving...' : 'Save password'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowPasswordForm(false); passwordForm.reset(); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-muted p-2.5">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Set a password to sign in with your email and password.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>
                  Change password
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Two-factor authentication */}
      <Card>
        <CardContent className="flex items-center gap-4 py-4">
          <div className="rounded-lg bg-muted p-2.5">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Two-factor authentication</p>
              <Badge variant="secondary" className="text-[10px]">Disabled</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add an extra layer of security to your account.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={comingSoon}>
            Set up
          </Button>
        </CardContent>
      </Card>

      {/* Unknown device verification */}
      <Card>
        <CardContent className="flex items-center gap-4 py-4">
          <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2.5">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Unknown device verification</p>
              <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Enabled</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              We&apos;ll verify your identity when you sign in from a new device.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={comingSoon}>
            Disable
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Connected accounts */}
      <div className="space-y-3">
        <Label>Connected accounts</Label>
        <Card>
          <CardContent className="py-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">Google</span>
              </div>
              <button type="button" onClick={comingSoon} className="text-xs text-primary hover:underline">
                Disconnect
              </button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="text-sm text-muted-foreground">Apple</span>
              </div>
              <button type="button" onClick={comingSoon} className="text-xs text-primary hover:underline">
                Connect
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="rounded-lg bg-destructive/10 p-2.5">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
