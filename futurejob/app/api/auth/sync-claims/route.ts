import { NextRequest, NextResponse } from "next/server";
import { isUserRole } from "@/lib/domain/enums";

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const { adminAuth, adminDb } = await import("@/lib/firebase/admin");

    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: "Missing bearer token." }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const role = userDoc.data()?.role;
    if (!isUserRole(role)) {
      return NextResponse.json({ error: "Invalid or missing role in Firestore." }, { status: 400 });
    }

    const userRecord = await adminAuth.getUser(uid);
    const existingClaims = userRecord.customClaims ?? {};
    const nextClaims = { ...existingClaims, role };

    await adminAuth.setCustomUserClaims(uid, nextClaims);

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Claim sync failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
