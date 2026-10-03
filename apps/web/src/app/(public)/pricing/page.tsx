'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      badge: 'Starter',
      description: 'Ideal for individuals, side projects, and testing ideas.',
      price: '$0',
      period: 'forever',
      cta: 'Start for Free',
      ctaHref: ROUTES.REGISTER,
      highlighted: false,
      features: [
        '1 Workspace',
        'Up to 3 Active Forms',
        '100 Submissions / month',
        '2 Team Members',
        'All 36 Field Types included',
        'Slash-command TipTap editor',
        'Direct Cloudinary uploads',
        'Standard Email support',
      ],
    },
    {
      name: 'Pro',
      badge: 'Most Popular',
      description: 'For creators, agencies, and teams scaling their forms.',
      price: billingPeriod === 'monthly' ? '$29' : '$24',
      period: billingPeriod === 'monthly' ? 'per month' : 'per month, billed annually',
      cta: 'Upgrade to Pro',
      ctaHref: ROUTES.REGISTER,
      highlighted: true,
      features: [
        'Unlimited Workspaces',
        'Unlimited Forms',
        '10,000 Submissions / month',
        'Unlimited Team Members',
        'Remove Snapform branding',
        'Advanced Conditional Logic',
        'Scheduled forms & submission limits',
        'Password-protected forms',
        'Priority support',
      ],
    },
    {
      name: 'Business',
      badge: 'Enterprise',
      description: 'For growing businesses requiring enterprise limits and security.',
      price: billingPeriod === 'monthly' ? '$89' : '$74',
      period: billingPeriod === 'monthly' ? 'per month' : 'per month, billed annually',
      cta: 'Get Business',
      ctaHref: ROUTES.REGISTER,
      highlighted: false,
      features: [
        'Unlimited Everything',
        'Unlimited Submissions',
        'Custom Domains (coming soon)',
        'Custom Webhooks & Integrations',
        'Role-Based Access Control (RBAC)',
        'Dedicated account onboarding',
        '99.9% Uptime SLA',
      ],
    },
  ];

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="outline" className="mb-3">Transparent Pricing</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Simple plans for every stage
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Start for free, then upgrade your workspace as your submission volume and team grow.
        </p>

        {/* Toggle */}
        <div className="mt-8 inline-flex items-center rounded-full border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('yearly')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              billingPeriod === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <span className="text-[10px] text-primary font-bold">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((p) => (
          <Card
            key={p.name}
            className={`flex flex-col justify-between transition-all ${
              p.highlighted
                ? 'border-primary shadow-xl shadow-primary/10 relative scale-105 z-10'
                : 'border-border/60'
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">{p.name}</span>
                <Badge variant={p.highlighted ? 'default' : 'secondary'} className="text-[10px]">
                  {p.badge}
                </Badge>
              </div>
              <CardDescription className="text-xs min-h-[32px]">{p.description}</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-extrabold tracking-tight">{p.price}</span>
                <span className="text-xs text-muted-foreground ml-1.5">/{p.period}</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                What&apos;s included:
              </div>
              {p.features.map((f) => (
                <div key={f} className="flex items-start gap-2.5 text-xs">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="pt-6">
              <Link
                href={p.ctaHref}
                className={cn(
                  buttonVariants({ variant: p.highlighted ? 'default' : 'outline' }),
                  'w-full flex items-center justify-center gap-1.5',
                )}
              >
                {p.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Callout */}
      <div className="mt-16 text-center text-sm text-muted-foreground">
        Have questions about custom plans or enterprise security?{' '}
        <Link href={ROUTES.HELP_CENTER} className="text-primary underline underline-offset-4">
          Check our FAQ
        </Link>{' '}
        or{' '}
        <Link href={ROUTES.CONTACT_SUPPORT} className="text-primary underline underline-offset-4">
          Contact support
        </Link>
        .
      </div>
    </div>
  );
}
