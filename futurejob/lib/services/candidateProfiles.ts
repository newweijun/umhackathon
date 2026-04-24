"use client";

import {
  doc,
  getDoc,
  setDoc,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";

export interface CandidateProfileRecord {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  experience?: string;
  skills?: string[] | string;
  [key: string]: unknown;
}

function toCandidateProfileRecord(
  snapshot: DocumentSnapshot<DocumentData>
): CandidateProfileRecord | null {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
  } as CandidateProfileRecord;
}

export async function getCandidateProfile(
  uid: string
): Promise<CandidateProfileRecord | null> {
  const snapshot = await getDoc(doc(firebaseDb, "candidateProfiles", uid));
  return toCandidateProfileRecord(snapshot);
}

export async function updateCandidateProfile(
  uid: string,
  data: Partial<Omit<CandidateProfileRecord, "id">>
): Promise<void> {
  await setDoc(doc(firebaseDb, "candidateProfiles", uid), data, { merge: true });
}

export async function getCandidateProfilesByIds(
  userIds: string[]
): Promise<Map<string, CandidateProfileRecord>> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const snapshots = await Promise.all(
    uniqueIds.map((uid) => getDoc(doc(firebaseDb, "candidateProfiles", uid)))
  );

  const pairs = snapshots
    .map((snapshot) => toCandidateProfileRecord(snapshot))
    .filter((record): record is CandidateProfileRecord => record !== null)
    .map((record) => [record.id, record] as const);

  return new Map(pairs);
}
