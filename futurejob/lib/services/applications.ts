"use client";

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { type ApplicationStatus as DomainApplicationStatus } from "@/lib/domain/enums";

export type ApplicationStatus = DomainApplicationStatus;

export interface ApplicationRecord {
  id: string;
  studentId: string;
  companyId: string;
  jobId: string;
  status: ApplicationStatus;
  createdAt?: unknown;
  [key: string]: unknown;
}

function toApplicationRecord(
  snapshot: QueryDocumentSnapshot<DocumentData>
): ApplicationRecord {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    studentId: data.studentId,
    companyId: data.companyId,
    jobId: data.jobId,
    status: data.status,
    createdAt: data.createdAt,
    ...data,
  } as ApplicationRecord;
}

// Index match: studentId + status + createdAt(desc)
export async function getStudentApplicationsByStatus(
  studentId: string,
  status: ApplicationStatus,
  take = 20
): Promise<ApplicationRecord[]> {
  const applicationsRef = collection(firebaseDb, "applications");
  const applicationsQuery = query(
    applicationsRef,
    where("studentId", "==", studentId),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(take)
  );

  const snapshot = await getDocs(applicationsQuery);
  return snapshot.docs.map(toApplicationRecord);
}

// Index match: companyId + status + createdAt(desc)
export async function getCompanyApplicationsByStatus(
  companyId: string,
  status: ApplicationStatus,
  take = 20
): Promise<ApplicationRecord[]> {
  const applicationsRef = collection(firebaseDb, "applications");
  const applicationsQuery = query(
    applicationsRef,
    where("companyId", "==", companyId),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(take)
  );

  const snapshot = await getDocs(applicationsQuery);
  return snapshot.docs.map(toApplicationRecord);
}

// Index match: jobId + status + createdAt(desc)
export async function getJobApplicationsByStatus(
  jobId: string,
  status: ApplicationStatus,
  take = 20
): Promise<ApplicationRecord[]> {
  const applicationsRef = collection(firebaseDb, "applications");
  const applicationsQuery = query(
    applicationsRef,
    where("jobId", "==", jobId),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(take)
  );

  const snapshot = await getDocs(applicationsQuery);
  return snapshot.docs.map(toApplicationRecord);
}

// Index match: companyId + jobId + createdAt(desc)
export async function getCompanyApplicationsByJob(
  companyId: string,
  jobId: string,
  take = 20
): Promise<ApplicationRecord[]> {
  const applicationsRef = collection(firebaseDb, "applications");
  const applicationsQuery = query(
    applicationsRef,
    where("companyId", "==", companyId),
    where("jobId", "==", jobId),
    orderBy("createdAt", "desc"),
    limit(take)
  );

  const snapshot = await getDocs(applicationsQuery);
  return snapshot.docs.map(toApplicationRecord);
}

