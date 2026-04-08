export const PLANS = {
  FREE: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Up to 3 forms',
      '100 submissions/month',
      'Basic analytics',
      'Snapform branding',
    ],
  },
  PRO: {
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Unlimited forms',
      '10,000 submissions/month',
      'Remove Snapform branding',
      'Custom domains',
      'Collaboration (unlimited members)',
      'File uploads',
      'Advanced analytics',
      'Email notifications',
      'Custom CSS',
      'Priority support',
    ],
  },
  BUSINESS: {
    name: 'Business',
    monthlyPrice: 89,
    yearlyPrice: 890,
    features: [
      'Everything in Pro',
      'Unlimited submissions',
      'Data retention control',
      'Email verification',
      'Version history (90 days)',
      'SSO / SAML',
      'API access',
      'Dedicated support',
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
