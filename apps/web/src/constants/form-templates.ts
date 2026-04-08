import type { FieldType } from '@/modules/form/types';
import type { FieldOption } from '@/features/editor/types';

export type TemplateCategory = 'feedback' | 'registration' | 'survey' | 'business' | 'other';

export interface TemplateField {
  type: FieldType;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  order: number;
  options: FieldOption[] | null;
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  fields: TemplateField[];
}

export const TEMPLATE_CATEGORIES: { label: string; value: TemplateCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Feedback', value: 'feedback' },
  { label: 'Registration', value: 'registration' },
  { label: 'Survey', value: 'survey' },
  { label: 'Business', value: 'business' },
  { label: 'Other', value: 'other' },
];

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'customer-feedback',
    title: 'Customer Feedback',
    description: 'Collect feedback from your customers about their experience with your product or service.',
    category: 'feedback',
    icon: 'MessageSquareHeart',
    fields: [
      { type: 'SHORT_TEXT', label: 'Your Name', description: null, placeholder: 'Enter your name', required: true, order: 0, options: null },
      { type: 'EMAIL', label: 'Email Address', description: null, placeholder: 'you@example.com', required: true, order: 1, options: null },
      { type: 'DROPDOWN', label: 'How did you hear about us?', description: null, placeholder: null, required: false, order: 2, options: [
        { label: 'Search engine', value: 'search_engine' },
        { label: 'Social media', value: 'social_media' },
        { label: 'Friend or colleague', value: 'friend' },
        { label: 'Advertisement', value: 'advertisement' },
        { label: 'Other', value: 'other' },
      ] },
      { type: 'RATING', label: 'Rate your overall experience', description: 'How would you rate your experience with us?', placeholder: null, required: true, order: 3, options: null },
      { type: 'LONG_TEXT', label: 'What did you enjoy most?', description: null, placeholder: 'Tell us what you liked...', required: false, order: 4, options: null },
      { type: 'LONG_TEXT', label: 'Any suggestions for improvement?', description: null, placeholder: 'How can we do better?', required: false, order: 5, options: null },
    ],
  },
  {
    id: 'event-feedback',
    title: 'Event Feedback',
    description: 'Gather attendee feedback after an event to improve future events.',
    category: 'feedback',
    icon: 'CalendarCheck',
    fields: [
      { type: 'SHORT_TEXT', label: 'Full Name', description: null, placeholder: 'Enter your name', required: true, order: 0, options: null },
      { type: 'RATING', label: 'How would you rate this event?', description: '1 = Poor, 5 = Excellent', placeholder: null, required: true, order: 1, options: null },
      { type: 'LONG_TEXT', label: 'What was the best part of the event?', description: null, placeholder: 'Share your highlights...', required: false, order: 2, options: null },
      { type: 'LONG_TEXT', label: 'How could we improve?', description: null, placeholder: 'Your suggestions...', required: false, order: 3, options: null },
      { type: 'RADIO', label: 'Would you attend again?', description: null, placeholder: null, required: true, order: 4, options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Maybe', value: 'maybe' },
      ] },
    ],
  },
  {
    id: 'event-registration',
    title: 'Event Registration',
    description: 'Let attendees register for your upcoming event with all necessary details.',
    category: 'registration',
    icon: 'CalendarPlus',
    fields: [
      { type: 'SHORT_TEXT', label: 'Full Name', description: null, placeholder: 'Enter your full name', required: true, order: 0, options: null },
      { type: 'EMAIL', label: 'Email Address', description: null, placeholder: 'you@example.com', required: true, order: 1, options: null },
      { type: 'PHONE', label: 'Phone Number', description: null, placeholder: '+1 (555) 000-0000', required: false, order: 2, options: null },
      { type: 'DATE', label: 'Select Event Date', description: null, placeholder: null, required: true, order: 3, options: null },
      { type: 'CHECKBOX', label: 'Dietary Restrictions', description: 'Select all that apply', placeholder: null, required: false, order: 4, options: [
        { label: 'None', value: 'none' },
        { label: 'Vegetarian', value: 'vegetarian' },
        { label: 'Vegan', value: 'vegan' },
        { label: 'Gluten-free', value: 'gluten_free' },
        { label: 'Other', value: 'other' },
      ] },
      { type: 'LONG_TEXT', label: 'Additional Notes', description: null, placeholder: 'Anything else we should know?', required: false, order: 5, options: null },
    ],
  },
  {
    id: 'newsletter-signup',
    title: 'Newsletter Signup',
    description: 'Grow your mailing list with a simple signup form.',
    category: 'registration',
    icon: 'MailPlus',
    fields: [
      { type: 'SHORT_TEXT', label: 'Name', description: null, placeholder: 'Your name', required: true, order: 0, options: null },
      { type: 'EMAIL', label: 'Email Address', description: null, placeholder: 'you@example.com', required: true, order: 1, options: null },
      { type: 'MULTI_SELECT', label: 'What topics interest you?', description: 'Select all that apply', placeholder: null, required: false, order: 2, options: [
        { label: 'Product Updates', value: 'product_updates' },
        { label: 'Industry News', value: 'industry_news' },
        { label: 'Tips & Tutorials', value: 'tips_tutorials' },
        { label: 'Company News', value: 'company_news' },
      ] },
    ],
  },
  {
    id: 'customer-satisfaction',
    title: 'Customer Satisfaction (CSAT)',
    description: 'Measure customer satisfaction with a structured CSAT survey.',
    category: 'survey',
    icon: 'ThumbsUp',
    fields: [
      { type: 'STATEMENT', label: 'We value your feedback! Please take a moment to rate your recent experience.', description: null, placeholder: null, required: false, order: 0, options: null },
      { type: 'SCALE', label: 'How satisfied are you overall?', description: '1 = Very dissatisfied, 10 = Very satisfied', placeholder: null, required: true, order: 1, options: null },
      { type: 'LONG_TEXT', label: 'What went well?', description: null, placeholder: 'Tell us what you liked...', required: false, order: 2, options: null },
      { type: 'LONG_TEXT', label: 'What could be improved?', description: null, placeholder: 'How can we do better?', required: false, order: 3, options: null },
      { type: 'RADIO', label: 'Would you recommend us to others?', description: null, placeholder: null, required: true, order: 4, options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ] },
    ],
  },
  {
    id: 'nps',
    title: 'Net Promoter Score (NPS)',
    description: 'Measure customer loyalty with the classic NPS question.',
    category: 'survey',
    icon: 'TrendingUp',
    fields: [
      { type: 'STATEMENT', label: 'We\'d love to hear from you! Your feedback helps us improve.', description: null, placeholder: null, required: false, order: 0, options: null },
      { type: 'SCALE', label: 'How likely are you to recommend us to a friend or colleague?', description: '1 = Not at all likely, 10 = Extremely likely', placeholder: null, required: true, order: 1, options: null },
      { type: 'LONG_TEXT', label: 'What is the primary reason for your score?', description: null, placeholder: 'Please explain...', required: false, order: 2, options: null },
      { type: 'EMAIL', label: 'Email (optional)', description: 'Leave your email if you\'d like us to follow up', placeholder: 'you@example.com', required: false, order: 3, options: null },
    ],
  },
  {
    id: 'contact-form',
    title: 'Contact Form',
    description: 'A simple contact form for your website visitors to reach out.',
    category: 'business',
    icon: 'Contact',
    fields: [
      { type: 'SHORT_TEXT', label: 'Full Name', description: null, placeholder: 'Enter your full name', required: true, order: 0, options: null },
      { type: 'EMAIL', label: 'Email Address', description: null, placeholder: 'you@example.com', required: true, order: 1, options: null },
      { type: 'PHONE', label: 'Phone Number', description: null, placeholder: '+1 (555) 000-0000', required: false, order: 2, options: null },
      { type: 'SHORT_TEXT', label: 'Subject', description: null, placeholder: 'What is this about?', required: true, order: 3, options: null },
      { type: 'LONG_TEXT', label: 'Message', description: null, placeholder: 'Type your message here...', required: true, order: 4, options: null },
    ],
  },
  {
    id: 'job-application',
    title: 'Job Application',
    description: 'Collect job applications with resume uploads and relevant details.',
    category: 'business',
    icon: 'Briefcase',
    fields: [
      { type: 'SHORT_TEXT', label: 'Full Name', description: null, placeholder: 'Enter your full name', required: true, order: 0, options: null },
      { type: 'EMAIL', label: 'Email Address', description: null, placeholder: 'you@example.com', required: true, order: 1, options: null },
      { type: 'PHONE', label: 'Phone Number', description: null, placeholder: '+1 (555) 000-0000', required: true, order: 2, options: null },
      { type: 'SHORT_TEXT', label: 'Position Applied For', description: null, placeholder: 'e.g. Frontend Developer', required: true, order: 3, options: null },
      { type: 'URL', label: 'LinkedIn Profile', description: null, placeholder: 'https://linkedin.com/in/yourprofile', required: false, order: 4, options: null },
      { type: 'FILE_UPLOAD', label: 'Resume / CV', description: 'Upload your resume in PDF format', placeholder: null, required: true, order: 5, options: null },
      { type: 'LONG_TEXT', label: 'Why are you interested in this position?', description: null, placeholder: 'Tell us about yourself...', required: true, order: 6, options: null },
    ],
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Create a simple multiple-choice quiz with page breaks between questions.',
    category: 'other',
    icon: 'HelpCircle',
    fields: [
      { type: 'SHORT_TEXT', label: 'Your Name', description: null, placeholder: 'Enter your name', required: true, order: 0, options: null },
      { type: 'PAGE_BREAK', label: 'Page Break', description: null, placeholder: null, required: false, order: 1, options: null },
      { type: 'RADIO', label: 'Question 1: What is the capital of France?', description: null, placeholder: null, required: true, order: 2, options: [
        { label: 'London', value: 'london' },
        { label: 'Berlin', value: 'berlin' },
        { label: 'Paris', value: 'paris' },
        { label: 'Madrid', value: 'madrid' },
      ] },
      { type: 'PAGE_BREAK', label: 'Page Break', description: null, placeholder: null, required: false, order: 3, options: null },
      { type: 'RADIO', label: 'Question 2: Which planet is closest to the Sun?', description: null, placeholder: null, required: true, order: 4, options: [
        { label: 'Venus', value: 'venus' },
        { label: 'Mercury', value: 'mercury' },
        { label: 'Mars', value: 'mars' },
        { label: 'Earth', value: 'earth' },
      ] },
      { type: 'PAGE_BREAK', label: 'Page Break', description: null, placeholder: null, required: false, order: 5, options: null },
      { type: 'DROPDOWN', label: 'Question 3: What is 7 × 8?', description: null, placeholder: null, required: true, order: 6, options: [
        { label: '48', value: '48' },
        { label: '54', value: '54' },
        { label: '56', value: '56' },
        { label: '64', value: '64' },
      ] },
    ],
  },
  {
    id: 'order-form',
    title: 'Order Form',
    description: 'Accept product orders with delivery details and special instructions.',
    category: 'other',
    icon: 'ShoppingCart',
    fields: [
      { type: 'SHORT_TEXT', label: 'Full Name', description: null, placeholder: 'Enter your full name', required: true, order: 0, options: null },
      { type: 'EMAIL', label: 'Email Address', description: null, placeholder: 'you@example.com', required: true, order: 1, options: null },
      { type: 'PHONE', label: 'Phone Number', description: null, placeholder: '+1 (555) 000-0000', required: false, order: 2, options: null },
      { type: 'DROPDOWN', label: 'Product', description: null, placeholder: null, required: true, order: 3, options: [
        { label: 'Product A', value: 'product_a' },
        { label: 'Product B', value: 'product_b' },
        { label: 'Product C', value: 'product_c' },
      ] },
      { type: 'NUMBER', label: 'Quantity', description: null, placeholder: '1', required: true, order: 4, options: null },
      { type: 'LONG_TEXT', label: 'Delivery Address', description: null, placeholder: 'Enter your full delivery address', required: true, order: 5, options: null },
      { type: 'DATE', label: 'Preferred Delivery Date', description: null, placeholder: null, required: false, order: 6, options: null },
      { type: 'LONG_TEXT', label: 'Special Instructions', description: null, placeholder: 'Any special requests?', required: false, order: 7, options: null },
    ],
  },
];
