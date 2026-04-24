import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin session
    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if the actor is an admin
    const adminUser = await adminDb.collection("users").doc(decodedToken.uid).get();
    if (adminUser.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
    }

    // 2. Update company verification status
    await adminDb.collection("companies").doc(companyId).set({
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: decodedToken.uid
    }, { merge: true });

    // 3. Convert all "draft" jobs for this company to "open"
    const jobsSnapshot = await adminDb.collection("jobs")
      .where("companyId", "==", companyId)
      .where("status", "==", "draft")
      .get();

    const batch = adminDb.batch();
    jobsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { status: "open", updatedAt: new Date() });
    });
    
    await batch.commit();

    return NextResponse.json({ ok: true, jobsUpdated: jobsSnapshot.size });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
