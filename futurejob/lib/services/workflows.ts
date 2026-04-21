"use client";

import {
  addDoc,
  collection,
  doc,
  updateDoc,
  orderBy,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  type ApplicationStatus,
  type InterviewStatus,
  type JobStatus,
  type NotificationType,
} from "@/lib/domain/enums";
import { firebaseDb } from "@/lib/firebase/client";
import {
  withCreatedAndUpdatedAt,
  withUpdatedAt,
} from "@/lib/services/timestamps";

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
    }),
  );
}

export type UpdateApplicationStatusInput = {
  applicationId: string;
  nextStatus: ApplicationStatus;
  actorRole: "company" | "admin";
  rejectionReason?: string;
  studentIdForNotification?: string;
};

export async function updateApplicationStatus(
  input: UpdateApplicationStatusInput,
) {
  const applicationRef = doc(firebaseDb, "applications", input.applicationId);

  await updateDoc(
    applicationRef,
    withUpdatedAt({
      status: input.nextStatus,
      rejectionReason: input.rejectionReason ?? null,
      statusUpdatedBy: input.actorRole,
    }),
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
    }),
  );
}
export async function applyForJob(input: {
  studentId: string;
  jobId: string;
  companyId: string;
  role: string;
  companyName: string;
  matchScore: number;
}) {
  const applicationsRef = collection(firebaseDb, "applications");

  // We denormalize 'role' and 'companyName' here so the dashboard
  // can load instantly without doing 3 separate database joins.
  const payload = withCreatedAndUpdatedAt({
    studentId: input.studentId,
    jobId: input.jobId,
    companyId: input.companyId,
    role: input.role,
    companyName: input.companyName,
    match: input.matchScore,
    status: "applied",
    feedback:
      "Your application has been received and is waiting for employer review.",
  });

  return addDoc(applicationsRef, payload);
}

// 2. Function to Save a Resume Generation Record
export async function saveResumeRecord(input: {
  studentId: string;
  targetRole: string;
  atsScore: number;
}) {
  const resumesRef = collection(firebaseDb, "resumes");
  return addDoc(
    resumesRef,
    withCreatedAndUpdatedAt({
      studentId: input.studentId,
      role: input.targetRole,
      score: input.atsScore,
    }),
  );
}

// 3. Function to Fetch Past Resumes
export async function getStudentResumes(studentId: string) {
  const resumesRef = collection(firebaseDb, "resumes");
  const indexedQuery = query(
    resumesRef,
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc"),
  );

  try {
    const snapshot = await getDocs(indexedQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    const isIndexBuildingError =
      error instanceof Error &&
      /requires an index|index is currently building/i.test(error.message);

    if (!isIndexBuildingError) {
      throw error;
    }

    const fallbackQuery = query(resumesRef, where("studentId", "==", studentId));
    const fallbackSnapshot = await getDocs(fallbackQuery);

    return fallbackSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const aMs = (a.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        const bMs = (b.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        return bMs - aMs;
      });
  }
}
