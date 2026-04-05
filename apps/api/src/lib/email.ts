import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logger.info(
      { to: options.to, subject: options.subject, text: options.text },
      'Email (dev mode - not sent)',
    );
    return;
  }

  const { error } = await getResend().emails.send({
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  if (error) {
    logger.error({ error, to: options.to }, 'Failed to send email via Resend');
    throw new Error(`Failed to send email: ${error.message}`);
  }

  logger.info({ to: options.to, subject: options.subject }, 'Email sent via Resend');
}
