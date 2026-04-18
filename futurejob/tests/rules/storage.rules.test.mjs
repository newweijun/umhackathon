import fs from "node:fs";
import test from "node:test";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { ref, uploadString, getBytes } from "firebase/storage";

const PROJECT_ID = "um-hackhoton-hipposenpai";
const storageRules = fs.readFileSync("firebase/storage.rules", "utf8");

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  storage: {
    rules: storageRules,
  },
});

test.after(async () => {
  await testEnv.cleanup();
});

test("student can upload own resume", async () => {
  const studentUid = "student-storage-1";
  const ctx = testEnv.authenticatedContext(studentUid, { role: "student" });
  const storage = ctx.storage();

  await assertSucceeds(
    uploadString(ref(storage, `resumes/${studentUid}/resume.txt`), "my resume")
  );
});

test("student cannot upload into another student resume folder", async () => {
  const studentUid = "student-storage-2";
  const ctx = testEnv.authenticatedContext(studentUid, { role: "student" });
  const storage = ctx.storage();

  await assertFails(
    uploadString(ref(storage, "resumes/other-user/resume.txt"), "not allowed")
  );
});

test("company can read student resume but cannot write student resume", async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const storage = ctx.storage();
    await uploadString(ref(storage, "resumes/student-storage-3/resume.txt"), "seed resume");
  });

  const companyUid = "company-storage-1";
  const companyCtx = testEnv.authenticatedContext(companyUid, { role: "company" });
  const companyStorage = companyCtx.storage();

  await assertSucceeds(getBytes(ref(companyStorage, "resumes/student-storage-3/resume.txt")));
  await assertFails(
    uploadString(ref(companyStorage, "resumes/student-storage-3/resume.txt"), "overwrite")
  );
});

test("company can upload own company-assets but not others", async () => {
  const companyUid = "company-storage-2";
  const companyCtx = testEnv.authenticatedContext(companyUid, { role: "company" });
  const storage = companyCtx.storage();

  await assertSucceeds(
    uploadString(ref(storage, `company-assets/${companyUid}/logo.png`), "binary-data")
  );

  await assertFails(
    uploadString(ref(storage, "company-assets/another-company/logo.png"), "bad")
  );
});
