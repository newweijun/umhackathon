"use client";

import { setDoc } from "firebase/firestore";
import { type DocumentData, type DocumentSnapshot } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";

export interface CandidateProfileRecord {
  id: string;
  fullName?: string;
  name?: string;
  phone?: string;
  experience?: string;
  skills?: string[] | string;
  email?: string;
  [key: string]: unknown;
}

function toCandidateProfileRecord(
  snapshot: DocumentSnapshot<DocumentData>,
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
  uid: string,
): Promise<CandidateProfileRecord | null> {
  const snapshot = await getDoc(doc(firebaseDb, "candidateProfiles", uid));
  return toCandidateProfileRecord(snapshot);
}

export async function updateCandidateProfile(
  uid: string,
  data: Partial<Omit<CandidateProfileRecord, "id">>,
): Promise<void> {
  await setDoc(doc(firebaseDb, "candidateProfiles", uid), data, {
    merge: true,
  });
}
import { getDoc, doc } from "firebase/firestore";
// Make sure firebaseDb and CandidateProfileRecord are imported!

export async function getCandidateProfilesByIds(
  userIds: string[],
): Promise<Map<string, CandidateProfileRecord>> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return new Map();
  }

  // Fetch data for all users simultaneously
  const pairs = await Promise.all(
    uniqueIds.map(async (uid) => {
      // 1. Fetch BOTH the profile and the user account data
      const profilePromise = getDoc(doc(firebaseDb, "candidateProfiles", uid));
      const userPromise = getDoc(doc(firebaseDb, "users", uid));

      const [profileSnap, userSnap] = await Promise.all([
        profilePromise,
        userPromise,
      ]);

      const profileData = profileSnap.exists() ? profileSnap.data() : {};
      const userData = userSnap.exists() ? userSnap.data() : {};

      // 2. If you have a toCandidateProfileRecord mapper, you can still use it,
      // but here we manually merge the user email into the profile record.
      const record = {
        id: uid,
        ...profileData,
        // Grab the email directly from the 'users' collection!
        email: userData.email || profileData.email || "No email provided",
        // Fallback for the name just in case
        fullName:
          profileData.fullName ||
          profileData.name ||
          userData.name ||
          "Student Candidate",
      } as CandidateProfileRecord;

      return [uid, record] as const;
    }),
  );

  return new Map(pairs);
}
