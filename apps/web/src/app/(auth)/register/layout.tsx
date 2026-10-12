import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | Snapform',
  description: 'Sign up for Snapform to create modern, interactive forms and surveys effortlessly.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
