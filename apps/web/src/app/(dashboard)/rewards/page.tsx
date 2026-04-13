'use client';

import { useState } from 'react';
import { Gift, Copy, Check, Share2, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export default function RewardsPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate a deterministic referral code from the user ID
  const referralCode = user ? `SNAP${user.id.slice(-6).toUpperCase()}` : 'SNAPCODE';
  const referralUrl = `https://snap-formn-web.vercel.app/register?ref=${referralCode}`;

  function handleCopy() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Rewards</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Refer a friend, earn free months of Pro.
        </p>
      </div>

      {/* Hero */}
      <div className="rounded-xl border bg-gradient-to-br from-primary/10 via-pink-500/5 to-purple-500/10 p-6 mb-6">
        <Badge className="bg-primary text-primary-foreground border-0 mb-3">
          <Sparkles className="mr-1 h-3 w-3" />
          Coming soon
        </Badge>
        <h2 className="text-xl font-bold mb-2">Get 1 month of Pro for every friend you refer</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          When a friend signs up using your link and upgrades to Pro, you both get a free month.
          The more you refer, the longer your reward.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
            <Users className="h-3 w-3" />
            <span>Referred</span>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
            <Sparkles className="h-3 w-3" />
            <span>Earned</span>
          </div>
          <p className="text-2xl font-bold">0 mo</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
            <Gift className="h-3 w-3" />
            <span>Pending</span>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Referral link */}
      <div className="rounded-xl border bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Your referral link</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Share this link with friends. You&apos;ll both get a free month of Pro when they upgrade.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-md border bg-muted/40 px-3 py-2 text-xs font-mono truncate">
            {referralUrl}
          </code>
          <Button size="sm" onClick={handleCopy} variant="outline">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="ml-1.5">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold mb-4">How it works</h3>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              1
            </span>
            <div>
              <p className="font-medium">Share your unique link</p>
              <p className="text-xs text-muted-foreground">
                Send your referral link to friends, colleagues, or your audience.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              2
            </span>
            <div>
              <p className="font-medium">They sign up and upgrade</p>
              <p className="text-xs text-muted-foreground">
                Your friend creates an account through your link and upgrades to Pro.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              3
            </span>
            <div>
              <p className="font-medium">You both earn 1 month free</p>
              <p className="text-xs text-muted-foreground">
                One free month of Pro is automatically credited to both accounts.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
