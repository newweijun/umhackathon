import "server-only";

import { adminDb } from "@/lib/firebase/admin";

export type AdminRoleCounts = {
  student: number;
  company: number;
  admin: number;
};

export type AdminJobCounts = {
  draft: number;
  open: number;
  closed: number;
};

export type AdminApplicationCounts = {
  submitted: number;
  reviewing: number;
  approved: number;
  rejected: number;
};

export type AdminRecentRow = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
};

export type AdminDashboardData = {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalRatings: number;
  totalAuditLogs: number;
  roleCounts: AdminRoleCounts;
  jobCounts: AdminJobCounts;
  applicationCounts: AdminApplicationCounts;
  recentUsers: AdminRecentRow[];
  recentJobs: AdminRecentRow[];
  recentApplications: AdminRecentRow[];
  recentRatings: AdminRecentRow[];
  recentAuditLogs: AdminRecentRow[];
};

function asText(value: unknown) {
  if (typeof value === "string") {
    return value.trim() ? value : "-";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "-";
}

function asTimestampValue(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function formatDate(value: unknown) {
  const date = asTimestampValue(value);

  if (!date) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function countDocsByField(
  docs: Array<{ data: () => Record<string, unknown> }>,
  field: string,
  allowedValues: string[]
) {
  return allowedValues.reduce((accumulator, value) => {
    accumulator[value] = docs.filter((doc) => doc.data()?.[field] === value).length;
    return accumulator;
  }, {} as Record<string, number>);
}

function isPermissionDeniedError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeCode = "code" in error ? (error as { code?: unknown }).code : undefined;
  const maybeMessage = "message" in error ? (error as { message?: unknown }).message : undefined;

  return (
    maybeCode === 7 ||
    (typeof maybeCode === "string" && maybeCode.toUpperCase().includes("PERMISSION_DENIED")) ||
    (typeof maybeMessage === "string" && maybeMessage.toUpperCase().includes("PERMISSION_DENIED"))
  );
}

async function getCollectionSnapshotOrEmpty(
  queryPromise: Promise<unknown>,
  collectionName: string
) {
  try {
    return await queryPromise;
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      console.warn(
        `[admin dashboard] permission denied when reading ${collectionName}; rendering with empty data.`
      );
      return { docs: [], size: 0 };
    }

    throw error;
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [usersSnapshot, jobsSnapshot, applicationsSnapshot, ratingSnapshot, auditSnapshot] =
    await Promise.all([
      getCollectionSnapshotOrEmpty(adminDb.collection("users").get(), "users"),
      getCollectionSnapshotOrEmpty(adminDb.collection("jobs").get(), "jobs"),
      getCollectionSnapshotOrEmpty(adminDb.collection("applications").get(), "applications"),
      getCollectionSnapshotOrEmpty(adminDb.collection("ratingResults").get(), "ratingResults"),
      getCollectionSnapshotOrEmpty(adminDb.collection("auditLogs").get(), "auditLogs"),
    ]);

  const roleCounts = countDocsByField(usersSnapshot.docs, "role", ["student", "company", "admin"]) as AdminRoleCounts;
  const jobCounts = countDocsByField(jobsSnapshot.docs, "status", ["draft", "open", "closed"]) as AdminJobCounts;
  const applicationCounts = countDocsByField(applicationsSnapshot.docs, "status", ["submitted", "reviewing", "approved", "rejected"]) as AdminApplicationCounts;

  const recentUsers = usersSnapshot.docs.slice(0, 5).map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: asText(data.email) || asText(data.uid) || "Unknown user",
      subtitle: `Role: ${asText(data.role)}`,
      meta: formatDate(data.updatedAt ?? data.createdAt),
    };
  });

  const recentJobs = jobsSnapshot.docs.slice(0, 5).map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: asText(data.title) || "Untitled job",
      subtitle: `Company: ${asText(data.companyId)} • Status: ${asText(data.status)}`,
      meta: formatDate(data.createdAt),
    };
  });

  const recentApplications = applicationsSnapshot.docs.slice(0, 5).map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: `Application ${asText(data.studentId)}`,
      subtitle: `Job: ${asText(data.jobId)} • Status: ${asText(data.status)}`,
      meta: formatDate(data.createdAt),
    };
  });

  const recentRatings = ratingSnapshot.docs.slice(0, 5).map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: `Score: ${asText(data.score)}`,
      subtitle: `Company: ${asText(data.companyId)} • Job: ${asText(data.jobId)}`,
      meta: formatDate(data.createdAt),
    };
  });

  const recentAuditLogs = auditSnapshot.docs.slice(0, 5).map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: asText(data.action) || "Audit event",
      subtitle: asText(data.actor) || asText(data.target) || "No details available",
      meta: formatDate(data.createdAt),
    };
  });

  return {
    totalUsers: usersSnapshot.size,
    totalJobs: jobsSnapshot.size,
    totalApplications: applicationsSnapshot.size,
    totalRatings: ratingSnapshot.size,
    totalAuditLogs: auditSnapshot.size,
    roleCounts,
    jobCounts,
    applicationCounts,
    recentUsers,
    recentJobs,
    recentApplications,
    recentRatings,
    recentAuditLogs,
  };
}

export async function getAdminUsersPageData() {
  const [usersSnapshot, jobsSnapshot, applicationsSnapshot] = await Promise.all([
    getCollectionSnapshotOrEmpty(
      adminDb.collection("users").orderBy("createdAt", "desc").limit(50).get(),
      "users"
    ),
    getCollectionSnapshotOrEmpty(adminDb.collection("jobs").get(), "jobs"),
    getCollectionSnapshotOrEmpty(adminDb.collection("applications").get(), "applications"),
  ]);

  const users = usersSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      uid: asText(data.uid) || doc.id,
      email: asText(data.email),
      role: asText(data.role),
      provider: asText(data.provider),
      createdAt: formatDate(data.createdAt),
      updatedAt: formatDate(data.updatedAt),
    };
  });

  const counts = countDocsByField(usersSnapshot.docs, "role", ["student", "company", "admin"]);

  return {
    totalUsers: usersSnapshot.size,
    totalJobs: jobsSnapshot.size,
    totalApplications: applicationsSnapshot.size,
    users,
    counts,
  };
}

export async function getAdminJobsPageData() {
  const [jobsSnapshot, applicationsSnapshot, ratingsSnapshot] = await Promise.all([
    getCollectionSnapshotOrEmpty(
      adminDb.collection("jobs").orderBy("createdAt", "desc").limit(50).get(),
      "jobs"
    ),
    getCollectionSnapshotOrEmpty(adminDb.collection("applications").get(), "applications"),
    getCollectionSnapshotOrEmpty(adminDb.collection("ratingResults").get(), "ratingResults"),
  ]);

  const jobs = jobsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: asText(data.title),
      companyId: asText(data.companyId),
      status: asText(data.status),
      createdAt: formatDate(data.createdAt),
    };
  });

  const counts = countDocsByField(jobsSnapshot.docs, "status", ["draft", "open", "closed"]);

  return {
    totalJobs: jobsSnapshot.size,
    totalApplications: applicationsSnapshot.size,
    totalRatings: ratingsSnapshot.size,
    jobs,
    counts,
  };
}

export async function getAdminModerationPageData() {
  const [applicationsSnapshot, auditSnapshot, usersSnapshot] = await Promise.all([
    getCollectionSnapshotOrEmpty(
      adminDb.collection("applications").orderBy("createdAt", "desc").limit(50).get(),
      "applications"
    ),
    getCollectionSnapshotOrEmpty(
      adminDb.collection("auditLogs").orderBy("createdAt", "desc").limit(50).get(),
      "auditLogs"
    ),
    getCollectionSnapshotOrEmpty(adminDb.collection("users").get(), "users"),
  ]);

  const pendingApplications = applicationsSnapshot.docs
    .filter((doc) => doc.data()?.status === "submitted" || doc.data()?.status === "reviewing")
    .slice(0, 10)
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: `Application ${asText(data.studentId)}`,
        subtitle: `Job ${asText(data.jobId)} • ${asText(data.companyId)}`,
        meta: `Status ${asText(data.status)} • ${formatDate(data.createdAt)}`,
      };
    });

  const recentAuditLogs = auditSnapshot.docs.slice(0, 10).map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: asText(data.action) || "Audit event",
      subtitle: asText(data.actor) || asText(data.target) || "No details available",
      meta: formatDate(data.createdAt),
    };
  });

  const userCounts = countDocsByField(usersSnapshot.docs, "role", ["student", "company", "admin"]);

  return {
    pendingApplications,
    recentAuditLogs,
    totalUsers: usersSnapshot.size,
    userCounts,
    totalPending: pendingApplications.length,
    totalAuditLogs: auditSnapshot.size,
  };
}