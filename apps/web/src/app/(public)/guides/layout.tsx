import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'How-to Guides' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
