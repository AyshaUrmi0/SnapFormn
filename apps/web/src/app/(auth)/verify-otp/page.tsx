'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useVerifyOtp } from '@/hooks/use-verify-otp';
import { useRequestOtp } from '@/hooks/use-request-otp';
import { verifyOtpSchema, type VerifyOtpValues } from '@/modules/auth/schemas';
import { ROUTES } from '@/constants/routes';
import type { OtpPurpose } from '@/modules/auth/types';

const TITLES: Record<OtpPurpose, string> = {
  EMAIL_VERIFICATION: 'Verify your email',
  PASSWORD_RESET: 'Enter reset code',
  LOGIN: 'Enter login code',
};

const DESCRIPTIONS: Record<OtpPurpose, string> = {
  EMAIL_VERIFICATION: 'We sent a 6-digit verification code to',
  PASSWORD_RESET: 'We sent a 6-digit reset code to',
  LOGIN: 'We sent a 6-digit login code to',
};

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const purpose = searchParams.get('purpose') as OtpPurpose | null;

  const verifyOtp = useVerifyOtp();
  const requestOtp = useRequestOtp();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email || !purpose) {
      router.replace(ROUTES.LOGIN);
    }
  }, [email, purpose, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = useCallback(() => {
    if (!email || !purpose) return;
    requestOtp.mutate(
      { email, purpose },
      { onSuccess: () => setCountdown(60) },
    );
  }, [email, purpose, requestOtp]);

  const form = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      code: '',
    },
  });

  function onSubmit(values: VerifyOtpValues) {
    if (!email || !purpose) return;
    verifyOtp.mutate({ email, code: values.code, purpose });
  }

  if (!email || !purpose) return null;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{TITLES[purpose]}</CardTitle>
        <CardDescription>
          {DESCRIPTIONS[purpose]} <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="text-center text-lg tracking-widest"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={verifyOtp.isPending}>
              {verifyOtp.isPending ? 'Verifying...' : 'Verify code'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Didn&apos;t receive a code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || requestOtp.isPending}
            className="text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
          </button>
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  );
}
