
export interface FormScheduleConfig {
  startsAt: string;
  endsAt: string;
  maxSubmissions: number;
}

export type ScheduleStatus =
  | { state: 'open' }
  | { state: 'not_yet_open'; opensAt: Date }
  | { state: 'closed_by_date'; closedAt: Date }
  | { state: 'closed_by_cap'; cap: number };

export function getScheduleStatus(
  schedule: FormScheduleConfig | undefined | null,
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

export function extractSchedule(settings: unknown): FormScheduleConfig | null {
  if (!settings || typeof settings !== 'object') return null;
  const obj = settings as Record<string, unknown>;
  const schedule = obj.schedule;
  if (!schedule || typeof schedule !== 'object') return null;
  const s = schedule as Record<string, unknown>;
  return {
    startsAt: typeof s.startsAt === 'string' ? s.startsAt : '',
    endsAt: typeof s.endsAt === 'string' ? s.endsAt : '',
    maxSubmissions: typeof s.maxSubmissions === 'number' ? s.maxSubmissions : 0,
  };
}
