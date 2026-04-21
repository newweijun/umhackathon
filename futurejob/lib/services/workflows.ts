"use client";

import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import {
  type ApplicationStatus,
  type InterviewStatus,
  type JobStatus,
  type NotificationType,
} from "@/lib/domain/enums";
import { firebaseDb } from "@/lib/firebase/client";
import { withCreatedAndUpdatedAt, withUpdatedAt } from "@/lib/services/timestamps";

export type CreateJobInput = {
  companyId: string;
  title: string;
  expectations?: string;
  salaryRange?: string;
  locationType?: string;
  locationDetails?: string;
  employmentType?: string;
  minQualification?: string;
  preferredQualification?: string;
  aboutJob?: string;
  keyResponsibilities?: string;
  status?: JobStatus;
};

export async function createJob(input: CreateJobInput) {
  const jobsRef = collection(firebaseDb, "jobs");
  const payload = withCreatedAndUpdatedAt({
    companyId: input.companyId,
    title: input.title,
    expectations: input.expectations ?? "",
    salaryRange: input.salaryRange ?? "",
    locationType: input.locationType ?? "Remote",
    locationDetails: input.locationDetails ?? "",
    employmentType: input.employmentType ?? "Full time",
    minQualification: input.minQualification ?? "",
    preferredQualification: input.preferredQualification ?? "",
    aboutJob: input.aboutJob ?? "",
    keyResponsibilities: input.keyResponsibilities ?? "",
    status: input.status ?? "draft",
  });

  return addDoc(jobsRef, payload);
}

export type CreateNotificationInput = {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  applicationId?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  const notificationsRef = collection(firebaseDb, "notifications");
  return addDoc(
    notificationsRef,
    withCreatedAndUpdatedAt({
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      applicationId: input.applicationId ?? null,
      read: false,
    })
  );
}

export type UpdateApplicationStatusInput = {
  applicationId: string;
  nextStatus: ApplicationStatus;
  actorRole: "company" | "admin";
  rejectionReason?: string;
  studentIdForNotification?: string;
};

export async function updateApplicationStatus(input: UpdateApplicationStatusInput) {
  const applicationRef = doc(firebaseDb, "applications", input.applicationId);

  await updateDoc(
    applicationRef,
    withUpdatedAt({
      status: input.nextStatus,
      rejectionReason: input.rejectionReason ?? null,
      statusUpdatedBy: input.actorRole,
    })
  );

  if (input.nextStatus === "rejected" && input.studentIdForNotification) {
    await createNotification({
      userId: input.studentIdForNotification,
      title: "Application Update",
      body: input.rejectionReason
        ? `Your application was rejected: ${input.rejectionReason}`
        : "Your application was rejected.",
      type: "application_rejected",
      applicationId: input.applicationId,
    });
  }

  if (input.nextStatus === "approved" && input.studentIdForNotification) {
    await createNotification({
      userId: input.studentIdForNotification,
      title: "Application Approved!",
      body: "Congratulations! Your application has been approved. You can now chat with the company and schedule an interview.",
      type: "application_approved",
      applicationId: input.applicationId,
    });
  }
}

export type CreateInterviewInput = {
  applicationId: string;
  companyId: string;
  studentId: string;
  scheduledAtISO: string;
  meetingLink?: string;
  status?: InterviewStatus;
};

export async function createInterview(input: CreateInterviewInput) {
  const interviewsRef = collection(firebaseDb, "interviews");
  return addDoc(
    interviewsRef,
    withCreatedAndUpdatedAt({
      applicationId: input.applicationId,
      companyId: input.companyId,
      studentId: input.studentId,
      scheduledAt: input.scheduledAtISO,
      meetingLink: input.meetingLink ?? "",
      status: input.status ?? "scheduled",
    })
  );
}
