'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How many forms can I create?',
    answer:
      'On the Free plan, you can create up to 3 forms per workspace. Pro and Business plans have unlimited forms.',
  },
  {
    question: 'How do I share my form with respondents?',
    answer:
      'Once you publish a form, you can share its public URL anywhere. You can also embed it in your website using an iframe — see the Sharing section under Form Settings.',
  },
  {
    question: 'Can I receive a copy of every submission by email?',
    answer:
      'Email notifications are coming soon as part of the Pro plan. For now, you can view all submissions in real time on the form\'s submissions page.',
  },
  {
    question: 'How do I upgrade or downgrade my plan?',
    answer:
      'Go to your workspace\'s billing page and click "Upgrade" or "Manage subscription". Each workspace has its own subscription, so you can mix Free and Pro workspaces.',
  },
  {
    question: 'Can I export my submissions?',
    answer:
      'Yes — submissions can be exported from the submissions page. CSV export is available, and Pro users get JSON export and API access.',
  },
  {
    question: 'How do I invite team members to a workspace?',
    answer:
      'Open the Members page in your workspace and click "Invite member". You can assign Owner, Admin, Editor, or Viewer roles. Free workspaces are limited to 2 members.',
  },
  {
    question: 'What happens if I delete a form?',
    answer:
      'Deleted forms move to the trash where they can be restored within 30 days. After 30 days they are permanently deleted along with all their submissions.',
  },
  {
    question: 'Are my forms protected with HTTPS?',
    answer:
      'Yes — all forms are served over HTTPS by default. Submissions are encrypted in transit and stored securely.',
  },
  {
    question: 'Can I password-protect a form?',
    answer:
      'Yes. Open the form settings and enable "Password protection" — respondents will need to enter the password before they can submit.',
  },
  {
    question: 'Do you support custom domains?',
    answer:
      'Custom domains are on our roadmap and will be available as part of the Pro plan. Check the Roadmap page for the latest status.',
  },
];

export default function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Help Center</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Frequently asked questions about using Snapform.
        </p>
      </div>

      <div className="space-y-2 mb-8">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question} className="rounded-xl border bg-card overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted/40 transition-colors"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="font-medium text-sm">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground shrink-0 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-muted-foreground border-t">
                  <p className="pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
        <h3 className="font-semibold mb-1">Still need help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Can&apos;t find the answer you&apos;re looking for? Reach out to our support team.
        </p>
        <Link
          href={ROUTES.CONTACT_SUPPORT}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <MessageCircle className="h-4 w-4" />
          Contact support
        </Link>
      </div>
    </div>
  );
}
