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
): Promise<InterviewRecord[]> {
  const interviewsRef = collection(firebaseDb, "interviews");
  const q = query(
    interviewsRef,
    where("companyId", "==", companyId),
    orderBy("scheduledAt", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InterviewRecord[];
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
