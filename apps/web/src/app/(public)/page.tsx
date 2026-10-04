'use client';

import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Layout,
  Sliders,
  UploadCloud,
  FileCheck,
  Star,
  Layers,
  Code2,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FORM_TEMPLATES } from '@/constants/form-templates';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const featuredTemplates = FORM_TEMPLATES.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Notion-style form builder</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-foreground/80">36 Field Types</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] mb-6">
            Build forms as simply as <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">writing a document</span>.
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Forget clunky drag-and-drop grids. Press <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-foreground text-xs font-mono">/</kbd> to insert questions, multi-step pages, signatures, or conditional logic. Try without signing up.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href={ROUTES.SANDBOX}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 font-semibold',
              )}
            >
              <Sparkles className="h-4 w-4" />
              Try Live Sandbox (No Signup) <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.TEMPLATES}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full sm:w-auto h-12 px-8 text-base flex items-center justify-center',
              )}
            >
              Explore 10+ Templates
            </Link>
          </div>

          {/* Key Value bullets */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free tier with unlimited responses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Full real-time preview</span>
            </div>
          </div>
        </div>

        {/* ─── LIVE EDITOR PREVIEW MOCKUP ─── */}
        <div className="mt-14 mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative rounded-2xl border border-border/80 bg-card p-2 sm:p-4 shadow-2xl shadow-primary/5">
            {/* Window chrome header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3 px-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-muted-foreground">snapform.app/f/customer-feedback-demo</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Live Respondent Preview</Badge>
                <Link
                  href={ROUTES.SANDBOX}
                  className="text-xs text-primary font-medium hover:underline hidden sm:inline-flex items-center gap-1"
                >
                  Edit in Sandbox →
                </Link>
              </div>
            </div>

            {/* Interactive Demo Body */}
            <div className="p-6 sm:p-10 max-w-2xl mx-auto space-y-8 text-left">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Customer Satisfaction Survey</h2>
                <p className="text-sm text-muted-foreground mt-1">Help us improve your experience with quick 2-minute feedback.</p>
              </div>

              {/* Sample Question 1: Rating */}
              <div className="space-y-3 p-4 rounded-xl border border-border/40 bg-accent/20">
                <label className="text-sm font-semibold flex items-center justify-between">
                  <span>1. How likely are you to recommend Snapform?</span>
                  <span className="text-xs text-primary font-normal">Rating block</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-2 rounded-lg border border-border/60 hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Question 2: Slash command hint */}
              <div className="space-y-3 p-4 rounded-xl border border-dashed border-border/80 bg-background/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="text-primary font-bold">/</span> Type a command to insert any block...
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">TipTap Powered</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="flex items-center gap-2 p-2 rounded-md border border-border/60 bg-muted/40 text-xs">
                    <FileCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Multiple Choice</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md border border-border/60 bg-muted/40 text-xs">
                    <UploadCloud className="h-3.5 w-3.5 text-primary" />
                    <span>File Upload</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md border border-border/60 bg-muted/40 text-xs">
                    <Sliders className="h-3.5 w-3.5 text-primary" />
                    <span>Ranking / Scale</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md border border-border/60 bg-muted/40 text-xs">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span>Branching Logic</span>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="pt-2">
                <Button className="w-full sm:w-auto px-6" disabled>
                  Submit Response
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-20 border-t border-border/40 bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to collect responses effortlessly
            </h2>
            <p className="text-muted-foreground">
              Built from the ground up to replace outdated form builders with modern speed, keyboard shortcuts, and developer flexibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="pt-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Layout className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Document-Style Writing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Treat forms like Notion pages. Combine text, headings, dividers, questions, and media seamlessly without messy drag-and-drop grids.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="pt-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Smart Conditional Logic</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Show or hide blocks, jump to specific thank you pages, or calculate totals based on respondent answers in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="pt-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Direct Signed Uploads</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Files, images, and signature captures upload directly to Cloudinary with cryptographically signed tokens. Zero server bottlenecks.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="pt-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Scheduling & Submission Caps</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Schedule open/close dates or automatically close registration once your maximum attendee limit is reached.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="pt-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Workspaces & Team RBAC</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Collaborate with team members using granular permissions: Owner, Admin, Editor, and Viewer with multi-workspace support.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="pt-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Code2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Embed Anywhere & Webhooks</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Embed clean iframes (`?embedded=true`), share public custom URLs, or pipe submissions into your databases via webhooks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── FEATURED TEMPLATES ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="outline" className="mb-2">Ready to Go</Badge>
              <h2 className="text-3xl font-bold tracking-tight">Jumpstart with pre-built templates</h2>
              <p className="text-muted-foreground mt-1">Start from battle-tested form designs and customize in seconds.</p>
            </div>
            <Link
              href={ROUTES.TEMPLATES}
              className={cn(buttonVariants({ variant: 'outline' }), 'flex items-center gap-1.5')}
            >
              View All 10+ Templates <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTemplates.map((t) => (
              <Card key={t.id} className="hover:border-primary/50 transition-all hover:shadow-md group">
                <CardContent className="pt-6 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <Badge variant="secondary" className="mb-3 text-[11px] capitalize">{t.category}</Badge>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{t.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                  </div>
                  <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t.fields.length} fields configured</span>
                    <Link
                      href={`${ROUTES.TEMPLATES}?template=${t.id}`}
                      className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'text-primary hover:text-primary')}
                    >
                      Preview
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION ─── */}
      <section className="py-20 border-t border-border/40 bg-gradient-to-b from-background to-muted/20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to build forms people actually enjoy filling?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Get started in under 30 seconds. Choose a template or create your first form from scratch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href={ROUTES.TEMPLATES}
              className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-8 text-base shadow-md flex items-center justify-center gap-2')}
            >
              Explore Templates <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 px-8 text-base flex items-center justify-center')}
            >
              Sign Up with Google or Email
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
