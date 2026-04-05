'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useCompleteProfile } from '@/hooks/use-complete-profile';
import { completeProfileSchema, type CompleteProfileValues } from '@/modules/auth/schemas';
import { ROUTES } from '@/constants/routes';

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const completeProfile = useCompleteProfile();

  useEffect(() => {
    if (!email) {
      router.replace(ROUTES.LOGIN);
    }
  }, [email, router]);

  const form = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
    },
  });

  function onSubmit(values: CompleteProfileValues) {
    completeProfile.mutate(values);
  }

  if (!email) return null;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Complete your profile</CardTitle>
        <CardDescription>
          Set up your account for <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="John"
                      autoComplete="given-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Doe"
                      autoComplete="family-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={completeProfile.isPending}>
              {completeProfile.isPending ? 'Setting up...' : 'Complete setup'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense>
      <CompleteProfileContent />
    </Suspense>
  );
}
