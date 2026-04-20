"use client";
import {
  doc,
  getDoc,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";

export interface CompanyProfileRecord {
  id: string;
  name?: string;
  logoUrl?: string;
  [key: string]: unknown;
}

function toCompanyProfileRecord(
  snapshot: DocumentSnapshot<DocumentData>,
): CompanyProfileRecord | null {
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as CompanyProfileRecord;
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
