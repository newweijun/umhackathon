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

export interface RatingResultRecord {
  id: string;
  applicationId?: string;
  studentId?: string;
  jobId?: string;
  companyId?: string;
  score?: number;
  reasoning?: string;
  reason?: string;
  [key: string]: unknown;
}

function toRatingResultRecord(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): RatingResultRecord {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
  } as RatingResultRecord;
}

function buildStudentJobKey(studentId?: string, jobId?: string) {
  if (!studentId || !jobId) {
    return null;
  }
  return `${studentId}::${jobId}`;
}

export async function getCompanyRatingResults(
  companyId: string,
  take = 100,
): Promise<RatingResultRecord[]> {
  const ratingRef = collection(firebaseDb, "ratingResults");
  const ratingQuery = query(
    ratingRef,
    where("companyId", "==", companyId),
    orderBy("createdAt", "desc"),
    limit(take),
  );

  const snapshot = await getDocs(ratingQuery);
  return snapshot.docs.map(toRatingResultRecord);
}

export function createRatingLookup(ratings: RatingResultRecord[]) {
  const byApplicationId = new Map<string, RatingResultRecord>();
  const byStudentJob = new Map<string, RatingResultRecord>();

  for (const rating of ratings) {
    if (rating.applicationId && !byApplicationId.has(rating.applicationId)) {
      byApplicationId.set(rating.applicationId, rating);
    }

    const key = buildStudentJobKey(rating.studentId, rating.jobId);
    if (key && !byStudentJob.has(key)) {
      byStudentJob.set(key, rating);
    }
  }

  return {
    byApplicationId,
    byStudentJob,
  };
}

export function getRatingForApplication(
  lookup: ReturnType<typeof createRatingLookup>,
  applicationId: string,
  studentId: string,
  jobId: string,
) {
  const byApplication = lookup.byApplicationId.get(applicationId);
  if (byApplication) {
    return byApplication;
  }

  const studentJobKey = buildStudentJobKey(studentId, jobId);
  if (!studentJobKey) {
    return null;
  }

  return lookup.byStudentJob.get(studentJobKey) ?? null;
}
export async function getStudentRatingResults(
  studentId: string,
  take = 100,
): Promise<RatingResultRecord[]> {
  const ratingRef = collection(firebaseDb, "ratingResults");
  const ratingQuery = query(
    ratingRef,
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc"),
    limit(take),
  );

  const snapshot = await getDocs(ratingQuery);
  return snapshot.docs.map(toRatingResultRecord);
}
