"use client";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { type InterviewStatus } from "@/lib/domain/enums";

export interface InterviewRecord {
  id: string;
  applicationId: string;
  companyId: string;
  studentId: string;
  scheduledAt: any;
  status: InterviewStatus;
  meetingLink?: string;
  notes?: string;
  createdAt: any;
}

export interface CompanyInterviewsResult {
  interviews: InterviewRecord[];
  usedFallback: boolean;
}

export async function scheduleInterview(
  data: Omit<InterviewRecord, "id" | "createdAt" | "status">
): Promise<string> {
  const interviewsRef = collection(firebaseDb, "interviews");
  const docRef = await addDoc(interviewsRef, {
    ...data,
    status: "scheduled",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getCompanyInterviews(
  companyId: string
): Promise<CompanyInterviewsResult> {
  const interviewsRef = collection(firebaseDb, "interviews");
  const indexedQuery = query(
    interviewsRef,
    where("companyId", "==", companyId),
    orderBy("scheduledAt", "asc")
  );

  try {
    const snapshot = await getDocs(indexedQuery);
    return {
      interviews: snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      })) as InterviewRecord[],
      usedFallback: false,
    };
  } catch (error) {
    const isIndexBuildingError =
      error instanceof Error &&
      /requires an index|index is currently building/i.test(error.message);

    if (!isIndexBuildingError) {
      throw error;
    }

    const fallbackQuery = query(
      interviewsRef,
      where("companyId", "==", companyId)
    );

    const fallbackSnapshot = await getDocs(fallbackQuery);
    return {
      interviews: (fallbackSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      })) as InterviewRecord[]).sort((a, b) => {
      const aMs = a.scheduledAt?.toMillis?.() ?? new Date(a.scheduledAt ?? 0).getTime();
      const bMs = b.scheduledAt?.toMillis?.() ?? new Date(b.scheduledAt ?? 0).getTime();
      return aMs - bMs;
      }),
      usedFallback: true,
    };
  }
}

export async function updateInterviewStatus(
  interviewId: string,
  status: InterviewStatus
): Promise<void> {
  const interviewRef = doc(firebaseDb, "interviews", interviewId);
  await updateDoc(interviewRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
