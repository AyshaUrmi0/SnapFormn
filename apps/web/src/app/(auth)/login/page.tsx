'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin as useGoogleOAuth } from '@react-oauth/google';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRequestOtp } from '@/hooks/use-request-otp';
import { useGoogleLogin } from '@/hooks/use-google-login';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/modules/auth/schemas';
import { ROUTES } from '@/constants/routes';

export default function LoginPage() {
  const router = useRouter();
  const requestOtp = useRequestOtp();
  const googleLogin = useGoogleLogin();

  const googleOAuth = useGoogleOAuth({
    onSuccess: (response) => {
      googleLogin.mutate(response.access_token);
    },
    onError: () => {
      toast.error('Google sign-in failed. Please try again.');
    },
  });

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(values: ForgotPasswordValues) {
    requestOtp.mutate(
      { email: values.email, purpose: 'LOGIN' },
      {
        onSuccess: () => {
          router.push(
            `${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(values.email)}&purpose=LOGIN`,
          );
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your Snapform account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => googleOAuth()}
          disabled={googleLogin.isPending}
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
          {googleLogin.isPending ? 'Signing in...' : 'Continue with Google'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={requestOtp.isPending}>
              <Mail className="mr-2 h-4 w-4" />
              {requestOtp.isPending ? 'Sending code...' : 'Continue with email'}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>
            Don&apos;t have an account?{' '}
            <Link href={ROUTES.REGISTER} className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <p>
            <Link href={ROUTES.FORGOT_PASSWORD} className="text-primary hover:underline">
              Forgot password?
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
