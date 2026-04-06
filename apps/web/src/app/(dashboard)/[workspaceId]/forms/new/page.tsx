'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
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
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useCreateForm } from '@/modules/form/form.queries';
import { createFormSchema, type CreateFormValues } from '@/modules/form/schemas';
import { ROUTES } from '@/constants/routes';

export default function NewFormPage() {
  const router = useRouter();
  const { workspace } = useWorkspaceContext();
  const createForm = useCreateForm();

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  function onSubmit(values: CreateFormValues) {
    createForm.mutate(
      { workspaceId: workspace.id, data: values },
      {
        onSuccess: (newForm) => {
          router.push(ROUTES.workspace(workspace.id).form(newForm.id).EDIT);
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link
        href={ROUTES.workspace(workspace.id).FORMS}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to forms
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create form</CardTitle>
          <CardDescription>Give your form a title to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="My Form" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={createForm.isPending}>
                {createForm.isPending ? 'Creating...' : 'Create form'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
