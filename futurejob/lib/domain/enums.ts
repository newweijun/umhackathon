export const USER_ROLES = ["student", "company", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const JOB_STATUSES = ["draft", "open", "closed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STATUSES = ["submitted", "reviewing", "approved", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const INTERVIEW_STATUSES = ["scheduled", "completed", "cancelled"] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const NOTIFICATION_TYPES = ["application_rejected", "interview_scheduled", "interview_updated"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}
