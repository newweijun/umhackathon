"use client";
import {
  doc,
  getDoc,
  setDoc,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";

export interface CompanyProfileRecord {
  id: string;
  name?: string;
  logoUrl?: string;
  industry?: string;
  size?: string;
  headquarters?: string;
  website?: string;
  about?: string;
  mission?: string;
  founded?: string;
  specialties?: string[] | string;
  [key: string]: unknown;
}

function toCompanyProfileRecord(
  snapshot: DocumentSnapshot<DocumentData>,
): CompanyProfileRecord | null {
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as CompanyProfileRecord;
}

export async function getCompanyProfile(
  uid: string
): Promise<CompanyProfileRecord | null> {
  const snapshot = await getDoc(doc(firebaseDb, "companies", uid));
  return toCompanyProfileRecord(snapshot);
}

export async function updateCompanyProfile(
  uid: string,
  data: Partial<Omit<CompanyProfileRecord, "id">>
): Promise<void> {
  await setDoc(doc(firebaseDb, "companies", uid), data, { merge: true });
}

export async function getCompanyProfilesByIds(
  companyIds: string[],
): Promise<Map<string, CompanyProfileRecord>> {
  const uniqueIds = Array.from(new Set(companyIds.filter(Boolean)));
  if (uniqueIds.length === 0) return new Map();

  const snapshots = await Promise.all(
    uniqueIds.map((id) => getDoc(doc(firebaseDb, "companies", id))),
  );

  const pairs = snapshots
    .map(toCompanyProfileRecord)
    .filter((record): record is CompanyProfileRecord => record !== null)
    .map((record) => [record.id, record] as const);

  return new Map(pairs);
}
