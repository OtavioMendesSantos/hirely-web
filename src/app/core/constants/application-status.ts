import { ApplicationStatus } from '../models/application.model';

export const APPLICATION_STATUS_PRESENTATION = {
  TO_APPLY: { label: 'To Apply', color: 'var(--status-to-apply)' },
  APPLIED: { label: 'Applied', color: 'var(--status-applied)' },
  INTERVIEW: { label: 'Interviewing', color: 'var(--status-interview)' },
  OFFER: { label: 'Offer', color: 'var(--status-offer)' },
  ACCEPTED: { label: 'Accepted', color: 'var(--status-accepted)' },
  REJECTED: { label: 'Rejected', color: 'var(--status-rejected)' },
  OTHER: { label: 'Other', color: 'var(--status-other)' },
} as const satisfies Record<ApplicationStatus, { label: string; color: string }>;
