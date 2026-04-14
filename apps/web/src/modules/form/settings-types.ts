export interface FormSuccessConfig {
  message: string;
  showSubmitAnother: boolean;
  redirectUrl: string;
}

export interface FormShareConfig {
  passwordEnabled: boolean;
  password: string;
  closedMessage: string;
}

export interface FormEmbedConfig {
  allowEmbed: boolean;
  embedHeight: number;
}

export interface FormScheduleConfig {
  /** ISO datetime when the form should start accepting submissions. Empty = open immediately. */
  startsAt: string;
  /** ISO datetime when the form should stop accepting submissions. Empty = no end date. */
  endsAt: string;
  /** Maximum number of submissions accepted before auto-closing. 0 = unlimited. */
  maxSubmissions: number;
}

export interface FormSettings {
  successPage?: FormSuccessConfig;
  share?: FormShareConfig;
  embed?: FormEmbedConfig;
  schedule?: FormScheduleConfig;
}

export const DEFAULT_SUCCESS_CONFIG: FormSuccessConfig = {
  message: 'Thank you! Your response has been submitted successfully.',
  showSubmitAnother: true,
  redirectUrl: '',
};

export const DEFAULT_SHARE_CONFIG: FormShareConfig = {
  passwordEnabled: false,
  password: '',
  closedMessage: 'This form is no longer accepting responses.',
};

export const DEFAULT_EMBED_CONFIG: FormEmbedConfig = {
  allowEmbed: true,
  embedHeight: 600,
};

export const DEFAULT_SCHEDULE_CONFIG: FormScheduleConfig = {
  startsAt: '',
  endsAt: '',
  maxSubmissions: 0,
};

/**
 * Pure function that checks if a form is currently accepting submissions
 * based on its schedule settings and current submission count. Used by both
 * frontend (to render countdown / closed UI) and backend (to gate submit).
 */
export type ScheduleStatus =
  | { state: 'open' }
  | { state: 'not_yet_open'; opensAt: Date }
  | { state: 'closed_by_date'; closedAt: Date }
  | { state: 'closed_by_cap'; cap: number };

export function getScheduleStatus(
  schedule: FormScheduleConfig | undefined,
  currentSubmissionCount: number,
  now: Date = new Date(),
): ScheduleStatus {
  if (!schedule) return { state: 'open' };

  if (schedule.startsAt) {
    const startsAt = new Date(schedule.startsAt);
    if (!Number.isNaN(startsAt.getTime()) && now < startsAt) {
      return { state: 'not_yet_open', opensAt: startsAt };
    }
  }

  if (schedule.endsAt) {
    const endsAt = new Date(schedule.endsAt);
    if (!Number.isNaN(endsAt.getTime()) && now > endsAt) {
      return { state: 'closed_by_date', closedAt: endsAt };
    }
  }

  if (schedule.maxSubmissions > 0 && currentSubmissionCount >= schedule.maxSubmissions) {
    return { state: 'closed_by_cap', cap: schedule.maxSubmissions };
  }

  return { state: 'open' };
}
