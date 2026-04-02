import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } else {
      // In development without SMTP config, log emails instead
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }
  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transport = getTransporter();

  const mailOptions = {
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  if (!env.SMTP_HOST) {
    // Log email in development
    logger.info({ to: options.to, subject: options.subject, text: options.text }, 'Email (dev mode - not sent)');
    return;
  }

  await transport.sendMail(mailOptions);
  logger.info({ to: options.to, subject: options.subject }, 'Email sent');
}
