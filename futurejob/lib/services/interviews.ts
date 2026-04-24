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
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { type InterviewStatus } from "@/lib/domain/enums";

export interface InterviewRecord {
  id: string;
  applicationId?: string; // Optional if scheduling directly from student ID
  companyId: string;
  studentId: string;
  companyName: string; // <-- ADD THIS
  role: string; // <-- ADD THIS
  scheduledAt: any;
  status: InterviewStatus | string;
  meetingLink?: string;
  notes?: string;
  createdAt: any;
}

export interface CompanyInterviewsResult {
  interviews: InterviewRecord[];
  usedFallback: boolean;
}

export async function scheduleInterview(
  data: Omit<InterviewRecord, "id" | "createdAt" | "status">,
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
  companyId: string,
): Promise<CompanyInterviewsResult> {
  const interviewsRef = collection(firebaseDb, "interviews");
  const indexedQuery = query(
    interviewsRef,
    where("companyId", "==", companyId),
    orderBy("scheduledAt", "asc"),
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
      where("companyId", "==", companyId),
    );

    const fallbackSnapshot = await getDocs(fallbackQuery);
    return {
      interviews: (
        fallbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InterviewRecord[]
      ).sort((a, b) => {
        const aMs =
          a.scheduledAt?.toMillis?.() ?? new Date(a.scheduledAt ?? 0).getTime();
        const bMs =
          b.scheduledAt?.toMillis?.() ?? new Date(b.scheduledAt ?? 0).getTime();
        return aMs - bMs;
      }),
      usedFallback: true,
    };
  }
}

export async function updateInterviewStatus(
  interviewId: string,
  status: InterviewStatus,
): Promise<void> {
  const interviewRef = doc(firebaseDb, "interviews", interviewId);
  await updateDoc(interviewRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
export async function getStudentInterviews(studentId: string) {
  const interviewsRef = collection(firebaseDb, "interviews");

  // A simple query with NO sorting. This will never trigger an index error.
  const simpleQuery = query(interviewsRef, where("studentId", "==", studentId));

  try {
    const snapshot = await getDocs(simpleQuery);

    console.log("🔥 DATABASE RETURNED:", snapshot.docs.length, "interviews");

    // Sort it using JavaScript instead of Firebase
    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InterviewRecord[];

    return results.sort((a, b) => {
      const aMs = a.scheduledAt?.toDate ? a.scheduledAt.toDate().getTime() : 0;
      const bMs = b.scheduledAt?.toDate ? b.scheduledAt.toDate().getTime() : 0;
      return aMs - bMs;
    });
  } catch (error) {
    console.error("❌ ERROR FETCHING STUDENT INTERVIEWS:", error);
    return [];
  }
}
export async function getStudentIdByEmail(
  email: string,
): Promise<string | null> {
  // Make sure "users" matches the collection name where you took that screenshot!
  const usersRef = collection(firebaseDb, "users");

  const q = query(usersRef, where("email", "==", email.trim()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  // 👇 THE FIX: Read the 'uid' field from inside the document data
  return snapshot.docs[0].data().uid;
}
