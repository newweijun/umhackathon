"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { type JobStatus as DomainJobStatus } from "@/lib/domain/enums";

export type JobStatus = DomainJobStatus;

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
  take = 20,
): Promise<JobRecord[]> {
  const jobsRef = collection(firebaseDb, "jobs");
  const jobsQuery = query(
    jobsRef,
    where("companyId", "==", companyId),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(take),
  );

  const snapshot = await getDocs(jobsQuery);
  return snapshot.docs.map(toJobRecord);
}

// Index match: status + createdAt(desc)
export async function getJobsByStatus(
  status: JobStatus,
  take = 20,
): Promise<JobRecord[]> {
  const jobsRef = collection(firebaseDb, "jobs");
  const jobsQuery = query(
    jobsRef,
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(take),
  );

  const snapshot = await getDocs(jobsQuery);
  return snapshot.docs.map(toJobRecord);
}

export async function getJobById(jobId: string): Promise<JobRecord | null> {
  const jobRef = doc(firebaseDb, "jobs", jobId);
  const snapshot = await getDoc(jobRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
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

function toJobRecordFromDoc(
  snapshot: DocumentSnapshot<DocumentData>,
): JobRecord | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return { id: snapshot.id, ...data } as JobRecord;
}

export async function getJobDetailsByIds(
  jobIds: string[],
): Promise<Map<string, JobRecord>> {
  const uniqueIds = Array.from(new Set(jobIds.filter(Boolean)));
  if (uniqueIds.length === 0) return new Map();

  const snapshots = await Promise.all(
    uniqueIds.map((id) => getDoc(doc(firebaseDb, "jobs", id))),
  );

  const pairs = snapshots
    .map(toJobRecordFromDoc)
    .filter((record): record is JobRecord => record !== null)
    .map((record) => [record.id, record] as const);

  return new Map(pairs);
}
