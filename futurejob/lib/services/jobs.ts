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

export type JobStatus = "draft" | "open" | "closed";

export interface JobRecord {
  id: string;
  companyId: string;
  title: string;
  status: JobStatus;
  createdAt?: unknown;
  [key: string]: unknown;
}

function toJobRecord(snapshot: QueryDocumentSnapshot<DocumentData>): JobRecord {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    companyId: data.companyId,
    title: data.title,
    status: data.status,
    createdAt: data.createdAt,
    ...data,
  } as JobRecord;
}

// Index match: companyId + status + createdAt(desc)
export async function getCompanyJobsByStatus(
  companyId: string,
  status: JobStatus,
  take = 20
): Promise<JobRecord[]> {
  const jobsRef = collection(firebaseDb, "jobs");
  const jobsQuery = query(
    jobsRef,
    where("companyId", "==", companyId),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(take)
  );

  const snapshot = await getDocs(jobsQuery);
  return snapshot.docs.map(toJobRecord);
}

// Index match: status + createdAt(desc)
export async function getJobsByStatus(
  status: JobStatus,
  take = 20
): Promise<JobRecord[]> {
  const jobsRef = collection(firebaseDb, "jobs");
  const jobsQuery = query(
    jobsRef,
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(take)
  );

  const snapshot = await getDocs(jobsQuery);
  return snapshot.docs.map(toJobRecord);
}
