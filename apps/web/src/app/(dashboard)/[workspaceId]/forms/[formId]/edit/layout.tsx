import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Form' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
