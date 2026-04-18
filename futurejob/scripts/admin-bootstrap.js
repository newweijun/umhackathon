const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function normalizePrivateKey(value) {
  return value.replace(/\\n/g, "\n");
}

async function main() {
  const uid = process.argv[2];
  const email = process.argv[3] || "";

  if (!uid) {
    throw new Error("Usage: node scripts/admin-bootstrap.js <uid> [email]");
  }

  const projectId = getEnv("FIREBASE_ADMIN_PROJECT_ID");
  const clientEmail = getEnv("FIREBASE_ADMIN_CLIENT_EMAIL");
  const privateKey = normalizePrivateKey(getEnv("FIREBASE_ADMIN_PRIVATE_KEY"));

  const app =
    getApps().find((instance) => instance.name === "futurejob-admin-bootstrap") ||
    initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      },
      "futurejob-admin-bootstrap"
    );

  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    await auth.getUser(uid);
  } catch {
    const userPayload = { uid };
    if (email) {
      userPayload.email = email;
    }

    await auth.createUser(userPayload);
  }

  await db.collection("users").doc(uid).set(
    {
      uid,
      email,
      role: "admin",
      provider: "bootstrap-script",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await auth.setCustomUserClaims(uid, { role: "admin" });

  console.log(`Admin bootstrap complete for uid=${uid}${email ? ` email=${email}` : ""}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
