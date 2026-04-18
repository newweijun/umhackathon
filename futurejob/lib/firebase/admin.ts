import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

const missingVars = [
  !projectId ? "FIREBASE_ADMIN_PROJECT_ID" : null,
  !clientEmail ? "FIREBASE_ADMIN_CLIENT_EMAIL" : null,
  !privateKey ? "FIREBASE_ADMIN_PRIVATE_KEY" : null,
].filter((value): value is string => value !== null);

if (missingVars.length > 0) {
  throw new Error(
    `Missing Firebase Admin credentials in environment variables: ${missingVars.join(", ")}.`
  );
}

const adminApp =
  getApps().find((app) => app.name === "futurejob-admin") ??
  initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    },
    "futurejob-admin"
  );

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
