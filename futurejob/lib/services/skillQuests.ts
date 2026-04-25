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

export interface SkillQuestRecord {
  id: string;
  studentId: string;
  jobId: string;
  summary?: string;
  gapSkills?: string[];
  reapplyCondition?: string;
  expectedScoreGain?: number;
  status?: string;
  createdAt?: unknown;
  [key: string]: unknown;
}

function toSkillQuestRecord(snapshot: QueryDocumentSnapshot<DocumentData>): SkillQuestRecord {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as SkillQuestRecord;
}

export async function getStudentSkillQuests(
  studentId: string,
  take = 20,
): Promise<SkillQuestRecord[]> {
  const ref = collection(firebaseDb, "skillQuests");
  const q = query(
    ref,
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc"),
    limit(take),
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(toSkillQuestRecord);
  } catch (error) {
    const isIndexBuildingError =
      error instanceof Error &&
      /requires an index|index is currently building/i.test(error.message);

    if (!isIndexBuildingError) {
      throw error;
    }

    const fallbackQuery = query(ref, where("studentId", "==", studentId));
    const fallbackSnapshot = await getDocs(fallbackQuery);
    
    const allRecords = fallbackSnapshot.docs.map(toSkillQuestRecord);
    return allRecords
      .sort((a, b) => {
        const aMs = (a.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        const bMs = (b.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        return bMs - aMs;
      })
      .slice(0, take);
  }
}
