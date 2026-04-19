import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

const PROJECT_ID = "um-hackhoton-hipposenpai";
const firestoreRules = fs.readFileSync("firebase/firestore.rules", "utf8");

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: {
    rules: firestoreRules,
  },
});

test.after(async () => {
  await testEnv.cleanup();
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
});

test("student can create own user profile with allowed role", async () => {
  const studentUid = "student-1";
  const ctx = testEnv.authenticatedContext(studentUid, { role: "student" });
  const db = ctx.firestore();

  await assertSucceeds(
    setDoc(doc(db, "users", studentUid), {
      uid: studentUid,
      email: "student@example.com",
      role: "student",
    })
  );
});

test("student cannot escalate role to admin", async () => {
  const studentUid = "student-2";

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "users", studentUid), {
      uid: studentUid,
      email: "student@example.com",
      role: "student",
    });
  });

  const ctx = testEnv.authenticatedContext(studentUid, { role: "student" });
  const db = ctx.firestore();

  await assertFails(
    setDoc(
      doc(db, "users", studentUid),
      {
        uid: studentUid,
        email: "student@example.com",
        role: "admin",
      },
      { merge: true }
    )
  );
});

test("student can read open job but not draft job", async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const adminDb = ctx.firestore();
    await setDoc(doc(adminDb, "jobs", "open-job"), {
      companyId: "company-1",
      status: "open",
      title: "Frontend Engineer",
    });
    await setDoc(doc(adminDb, "jobs", "draft-job"), {
      companyId: "company-1",
      status: "draft",
      title: "Draft Position",
    });
  });

  const studentCtx = testEnv.authenticatedContext("student-3", { role: "student" });
  const studentDb = studentCtx.firestore();

  await assertSucceeds(getDoc(doc(studentDb, "jobs", "open-job")));
  await assertFails(getDoc(doc(studentDb, "jobs", "draft-job")));
});

test("company can only create job for own companyId", async () => {
  const companyUid = "company-1";
  const companyCtx = testEnv.authenticatedContext(companyUid, { role: "company" });
  const companyDb = companyCtx.firestore();

  await assertSucceeds(
    setDoc(doc(companyDb, "jobs", "company-job-1"), {
      companyId: companyUid,
      status: "open",
      title: "Backend Engineer",
    })
  );

  await assertFails(
    setDoc(doc(companyDb, "jobs", "company-job-2"), {
      companyId: "other-company",
      status: "open",
      title: "Should Fail",
    })
  );
});

test("student can submit application only to open job with matching companyId", async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const adminDb = ctx.firestore();
    await setDoc(doc(adminDb, "jobs", "job-open-1"), {
      companyId: "company-7",
      status: "open",
      title: "Open Role",
    });
  });

  const studentUid = "student-7";
  const studentCtx = testEnv.authenticatedContext(studentUid, { role: "student" });
  const studentDb = studentCtx.firestore();

  await assertSucceeds(
    setDoc(doc(studentDb, "applications", "app-1"), {
      studentId: studentUid,
      companyId: "company-7",
      jobId: "job-open-1",
      status: "submitted",
    })
  );

  await assertFails(
    setDoc(doc(studentDb, "applications", "app-2"), {
      studentId: studentUid,
      companyId: "company-wrong",
      jobId: "job-open-1",
      status: "submitted",
    })
  );

  assert.ok(true);
});
