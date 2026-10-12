'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin as useGoogleOAuth } from '@react-oauth/google';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRegister } from '@/hooks/use-register';
import { useGoogleLogin } from '@/hooks/use-google-login';
import { registerSchema, type RegisterValues } from '@/modules/auth/schemas';
import { ROUTES } from '@/constants/routes';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const register = useRegister();
  const googleLogin = useGoogleLogin();

  const googleOAuth = useGoogleOAuth({
    onSuccess: (response) => {
      googleLogin.mutate(response.access_token);
    },
    onError: () => {
      toast.error('Google sign-up failed. Please try again.');
    },
  });

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const passwordValue = form.watch('password') || '';

  // Password requirements calculation
  const hasMinLength = passwordValue.length >= 8;
  const hasMixedCase = /[a-z]/.test(passwordValue) && /[A-Z]/.test(passwordValue);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordValue);

  const passedCriteriaCount = [hasMinLength, hasMixedCase, hasNumberOrSymbol].filter(Boolean).length;
  const strengthColor =
    passedCriteriaCount === 0
      ? 'bg-muted'
      : passedCriteriaCount === 1
      ? 'bg-rose-500'
      : passedCriteriaCount === 2
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const strengthLabel =
    passedCriteriaCount === 0
      ? ''
      : passedCriteriaCount === 1
      ? 'Weak'
      : passedCriteriaCount === 2
      ? 'Medium'
      : 'Strong';

  function onSubmit(values: RegisterValues) {
    register.mutate(values);
  }

  return (
    <div className="relative w-full">
      {/* Floating Value Proposition Badges (Desktop XL+) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[calc(100%+1.25rem)] top-10 hidden xl:flex w-56 items-center gap-3 rounded-2xl border border-border/70 bg-card/90 p-3.5 shadow-xl shadow-primary/5 backdrop-blur-xl animate-in fade-in slide-in-from-left-4 duration-700 transition-transform"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">Free Forever</div>
          <div className="text-[11px] text-muted-foreground truncate">No credit card required</div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[calc(100%+1.25rem)] top-20 hidden xl:flex w-56 items-center gap-3 rounded-2xl border border-border/70 bg-card/90 p-3.5 shadow-xl shadow-primary/5 backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-700 delay-150 transition-transform"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">Data Privacy First</div>
          <div className="text-[11px] text-muted-foreground truncate">Encrypted & GDPR ready</div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[calc(100%+1.25rem)] bottom-12 hidden 2xl:flex w-56 items-center gap-3 rounded-2xl border border-border/70 bg-card/90 p-3.5 shadow-xl shadow-primary/5 backdrop-blur-xl animate-in fade-in slide-in-from-left-4 duration-700 delay-300 transition-transform"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">
          <Zap className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">Ready in Seconds</div>
          <div className="text-[11px] text-muted-foreground truncate">Create forms in 60s</div>
        </div>
      </div>

      {/* Main Glassmorphic Registration Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 dark:bg-card/70 backdrop-blur-2xl p-6 sm:p-9 shadow-2xl shadow-primary/5 transition-all">
        {/* Luminous Top Accent Line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
        />

        {/* Card Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-amber-500 text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/10">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Create account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join thousands building modern forms with Snapform
          </p>
        </div>

        {/* Quick Social Sign-up */}
        <Button
          type="button"
          variant="outline"
          className="relative h-11 w-full rounded-xl border-border/80 bg-background/50 hover:bg-muted/60 font-medium shadow-xs transition-all duration-200 active:scale-[0.99] gap-3 cursor-pointer"
          onClick={() => googleOAuth()}
          disabled={googleLogin.isPending}
        >
          {googleLogin.isPending ? (
            <Spinner size="default" variant="muted" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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
          )}
          <span className="text-sm">
            {googleLogin.isPending ? 'Connecting with Google...' : 'Continue with Google'}
          </span>
        </Button>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative rounded-full bg-card/90 px-3 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
            or continue with email
          </div>
        </div>

        {/* Registration Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Full Name
                    </FormLabel>
                    <span className="text-[11px] text-muted-foreground/75 font-normal">
                      Optional
                    </span>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Alex Morgan"
                        autoComplete="name"
                        className="h-11 rounded-xl border-border/70 bg-background/50 pl-10 pr-3.5 text-sm transition-all hover:border-border focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 dark:bg-background/30"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="h-11 rounded-xl border-border/70 bg-background/50 pl-10 pr-3.5 text-sm transition-all hover:border-border focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 dark:bg-background/30"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Password
                    </FormLabel>
                    {passwordValue.length > 0 && (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Strength: <span className="font-semibold text-foreground">{strengthLabel}</span>
                      </span>
                    )}
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        className="h-11 rounded-xl border-border/70 bg-background/50 pl-10 pr-10 text-sm transition-all hover:border-border focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 dark:bg-background/30"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />

                  {/* Password Strength Meter & Hints */}
                  {passwordValue.length > 0 && (
                    <div className="mt-2 space-y-2 animate-in fade-in duration-200">
                      {/* Bar indicator */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                          className={`h-full transition-all duration-300 ${strengthColor}`}
                          style={{ width: `${(passedCriteriaCount / 3) * 100}%` }}
                        />
                      </div>

                      {/* Criteria check items */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px]">
                        <span
                          className={`inline-flex items-center gap-1 transition-colors ${
                            hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                          }`}
                        >
                          {hasMinLength ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />}
                          8+ characters
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 transition-colors ${
                            hasMixedCase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                          }`}
                        >
                          {hasMixedCase ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />}
                          Uppercase & lowercase
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 transition-colors ${
                            hasNumberOrSymbol ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                          }`}
                        >
                          {hasNumberOrSymbol ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />}
                          Number or symbol
                        </span>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Terms and Privacy note */}
            <p className="text-[11px] leading-relaxed text-muted-foreground pt-1">
              By creating an account, you agree to our{' '}
              <span className="text-foreground underline decoration-border underline-offset-2 hover:text-primary transition-colors cursor-pointer">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-foreground underline decoration-border underline-offset-2 hover:text-primary transition-colors cursor-pointer">
                Privacy Policy
              </span>
              .
            </p>

            {/* Submit Button */}
            <Button
              type="submit"
              className="relative h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer"
              disabled={register.isPending}
            >
              {register.isPending ? (
                <>
                  <Spinner size="default" className="text-primary-foreground" />
                  <span>Creating your account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Footer links */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href={ROUTES.LOGIN}
            className="font-semibold text-primary hover:text-primary/80 transition-colors hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
