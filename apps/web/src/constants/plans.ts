import type { LucideIcon } from 'lucide-react';
import {
  Sparkles,
  Globe,
  Users,
  BarChart3,
  Paintbrush,
  Mail,
  Layers,
  Upload,
  TrendingUp,
  History,
  Zap,
  ShieldCheck,
  Shield,
  Lock,
  Verified,
  Infinity as InfinityIcon,
} from 'lucide-react';

export interface PlanFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface PlanDef {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
}

export const PLANS: Record<'FREE' | 'PRO' | 'BUSINESS', PlanDef> = {
  FREE: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { title: 'Up to 3 forms', description: 'Build simple forms with basic field types.', icon: Layers },
      { title: '100 submissions/mo', description: 'Collect responses from respondents.', icon: BarChart3 },
      { title: 'Basic analytics', description: 'See submission counts and recent activity.', icon: TrendingUp },
      { title: 'Snapform branding', description: 'Forms display Snapform branding.', icon: Sparkles },
    ],
  },
  PRO: {
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      { title: 'Remove branding', description: 'Remove Snapform branding from forms.', icon: Sparkles },
      { title: 'Custom domains', description: 'Host forms on your own domain.', icon: Globe },
      { title: 'Collaboration', description: 'Invite unlimited members to your workspace.', icon: Users },
      { title: 'Partial submissions', description: 'Capture responses even if not submitted.', icon: Zap },
      { title: 'Advanced customization', description: 'Tailor every part of your form.', icon: Paintbrush },
      { title: 'Custom CSS', description: 'Style your forms with your own CSS.', icon: Paintbrush },
      { title: 'Email notifications', description: 'Get alerts on new submissions.', icon: Mail },
      { title: 'Custom email domains', description: 'Send notifications from your domain.', icon: Mail },
      { title: 'Link preview', description: 'Customize link preview metadata.', icon: Sparkles },
      { title: 'Workspaces', description: 'Create unlimited workspaces.', icon: Layers },
      { title: 'Unlimited uploads', description: 'Accept larger file uploads from respondents.', icon: Upload },
      { title: 'Form analytics', description: 'Detailed visit and engagement analytics.', icon: BarChart3 },
      { title: 'Drop-off analytics', description: 'See where respondents leave your form.', icon: TrendingUp },
      { title: 'Version history', description: 'Restore previous versions within 30 days.', icon: History },
      { title: 'Premium integrations', description: 'Connect with top-tier tools and apps.', icon: Zap },
    ],
  },
  BUSINESS: {
    name: 'Business',
    monthlyPrice: 89,
    yearlyPrice: 890,
    features: [
      { title: 'Everything in Pro', description: 'All Pro features, included.', icon: InfinityIcon },
      { title: 'Data retention control', description: 'Manage how long submissions are stored.', icon: ShieldCheck },
      { title: 'Verify emails', description: 'Require email verification from respondents.', icon: Verified },
      { title: 'Version history (90d)', description: 'Restore previous versions within 90 days.', icon: History },
      { title: 'SSO / SAML', description: 'Single sign-on for your organization.', icon: Lock },
      { title: 'Advanced security', description: 'Stronger controls and audit logs.', icon: Shield },
    ],
  },
};

export type PlanKey = keyof typeof PLANS;
