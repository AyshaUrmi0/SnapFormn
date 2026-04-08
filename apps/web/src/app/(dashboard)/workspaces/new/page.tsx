'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { slugify } from '@snapform/shared';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateWorkspace } from '@/modules/workspace/workspace.queries';
import { createWorkspaceSchema, type CreateWorkspaceValues } from '@/modules/workspace/schemas';
import { ROUTES } from '@/constants/routes';

export default function NewWorkspacePage() {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();
  const slugManuallyEdited = useRef(false);

  const form = useForm<CreateWorkspaceValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const nameValue = form.watch('name');

  useEffect(() => {
    if (!slugManuallyEdited.current && nameValue) {
      form.setValue('slug', slugify(nameValue));
    }
  }, [nameValue, form]);

  function onSubmit(values: CreateWorkspaceValues) {
    const data = {
      name: values.name,
      ...(values.slug ? { slug: values.slug } : {}),
    };
    createWorkspace.mutate(data, {
      onSuccess: (workspace) => {
        router.push(ROUTES.workspace(workspace.id).FORMS);
      },
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link
        href={ROUTES.WORKSPACES}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to workspaces
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create workspace</CardTitle>
          <CardDescription>
            A workspace is where your team collaborates on forms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Workspace" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="my-workspace"
                        {...field}
                        onChange={(e) => {
                          slugManuallyEdited.current = true;
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      URL-friendly identifier. Auto-generated from name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={createWorkspace.isPending}>
                {createWorkspace.isPending ? 'Creating...' : 'Create workspace'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
