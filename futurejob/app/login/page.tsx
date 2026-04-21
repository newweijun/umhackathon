"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { type UserRole } from "@/lib/domain/enums";
import { firebaseAuth, firebaseDb } from "@/lib/firebase/client";
import { withCreatedAndUpdatedAt } from "@/lib/services/timestamps";

type Mode = "signin" | "signup";
const AUTH_COOKIE_NAME = "fj_token";

function setAuthCookie(token: string) {
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; Path=/; Max-Age=3600; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

async function readApiErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "Failed to sync role claims.";
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    return "Failed to sync role claims.";
  }

  if (rawText.includes("<!DOCTYPE") || rawText.includes("<html")) {
    return "Sync claims endpoint returned an HTML error page. Check Firebase Admin env vars and server logs.";
  }

  return rawText;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [claimsSyncing, setClaimsSyncing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLocalHostReady, setIsLocalHostReady] = useState(false);

  const hiddenAdminEnabled =
    isLocalHostReady && process.env.NODE_ENV !== "production" && searchParams.get("admin") === "1";

  const nextParam = searchParams.get("next");

  useEffect(() => {
    setIsLocalHostReady(
      typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)
    );
  }, []);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (nextUser) => setUser(nextUser));
  }, []);

  useEffect(() => {
    return onIdTokenChanged(firebaseAuth, async (nextUser) => {
      if (!nextUser) {
        clearAuthCookie();
        return;
      }

      const token = await nextUser.getIdToken();
      setAuthCookie(token);
    });
  }, []);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        return;
      }

      setProfileLoading(true);
      try {
        const userRef = doc(firebaseDb, "users", user.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const nextRole = snapshot.data().role;
          if (nextRole === "student" || nextRole === "company" || nextRole === "admin") {
            setRole(nextRole);
            return;
          }
        }

        const tokenResult = await user.getIdTokenResult(true);
        const claimRole = tokenResult.claims.role;
        if (claimRole === "admin") {
          setRole("admin");
          return;
        }

        setRole(null);
      } catch (profileError) {
        const message = profileError instanceof Error ? profileError.message : "Failed to load profile.";
        setError(message);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchRole();
  }, [user]);

  useEffect(() => {
    async function syncClaimsAndRedirect() {
      if (!user || !role) {
        return;
      }

      setClaimsSyncing(true);
      setError(null);

      try {
        const idToken = await user.getIdToken();
        const response = await fetch("/api/auth/sync-claims", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          const message = await readApiErrorMessage(response);
          throw new Error(message);
        }

        await user.getIdToken(true);

        const roleDefaultPath =
          role === "admin"
            ? "/admin/dashboard"
            : role === "company"
              ? "/company/dashboard"
              : "/student/dashboard";

        const isSafeNextPath =
          typeof nextParam === "string" && nextParam.startsWith("/") && !nextParam.startsWith("//");

        const targetPath = isSafeNextPath ? nextParam : roleDefaultPath;
        router.replace(targetPath);
      } catch (syncError) {
        const message = syncError instanceof Error ? syncError.message : "Failed to sync role claims.";
        setError(message);
      } finally {
        setClaimsSyncing(false);
      }
    }

    syncClaimsAndRedirect();
  }, [user, role, router, nextParam]);

  const actionLabel = useMemo(() => {
    return mode === "signin" ? "Log in" : "Create account";
  }, [mode]);

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      }
      setPassword("");
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "Authentication failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "Google login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setError(null);
    setLoading(true);
    try {
      await signOut(firebaseAuth);
      clearAuthCookie();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "Sign out failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleSelection(nextRole: UserRole) {
    if (!user) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const userRef = doc(firebaseDb, "users", user.uid);
      await setDoc(
        userRef,
        withCreatedAndUpdatedAt({
          uid: user.uid,
          email: user.email ?? "",
          role: nextRole,
          provider: user.providerData[0]?.providerId ?? "password",
        }),
        { merge: true }
      );

      const refreshedToken = await user.getIdToken(true);
      setAuthCookie(refreshedToken);
    } catch (profileError) {
      const message = profileError instanceof Error ? profileError.message : "Failed to save role.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-card p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-3">FutureJob</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentication</h1>
        <p className="text-sm text-slate-500 mb-6">Use Email/Password or Google to continue.</p>

        <div className="flex rounded-lg p-1 bg-slate-100 mb-6">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Sign up
          </button>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-800 font-medium">Signed in as</p>
              <p className="text-sm text-emerald-700 break-all">{user.email ?? user.uid}</p>
            </div>

            {profileLoading ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Loading your profile...
              </div>
            ) : !role ? (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-3">
                <p className="text-sm text-indigo-900 font-semibold">Choose your role to continue</p>
                <div className={`grid ${hiddenAdminEnabled ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleRoleSelection("student")}
                    className="rounded-lg bg-white border border-indigo-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70 cursor-pointer"
                  >
                    I am a Student
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleRoleSelection("company")}
                    className="rounded-lg bg-white border border-indigo-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70 cursor-pointer"
                  >
                    I am a Company
                  </button>
                  {hiddenAdminEnabled ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRoleSelection("admin")}
                      className="rounded-lg bg-slate-900 border border-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70 cursor-pointer"
                    >
                      Admin Mode
                    </button>
                  ) : null}
                </div>
                <p className="text-xs text-indigo-700">
                  Your selection will be saved to Firestore users/{user.uid}.
                </p>
                {hiddenAdminEnabled ? (
                  <p className="text-xs text-amber-700">
                    Hidden local admin mode is enabled. This is only visible on localhost with ?admin=1.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-sm text-indigo-900 font-semibold">Role detected: {role}</p>
                <p className="text-xs text-indigo-700 mt-1">
                  {claimsSyncing ? "Syncing custom claims..." : "Redirecting to your dashboard..."}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Processing..." : "Sign out"}
            </button>
            <div className="flex items-center justify-center gap-4 text-sm">
              <Link href="/company/dashboard" className="text-indigo-600 font-medium hover:text-indigo-700">
                Company Dashboard
              </Link>
              <Link href="/admin/dashboard" className="text-indigo-600 font-medium hover:text-indigo-700">
                Admin Dashboard
              </Link>
              <Link href="/jobs" className="text-indigo-600 font-medium hover:text-indigo-700">
                Jobs
              </Link>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="At least 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-70 cursor-pointer"
              >
                {loading ? "Processing..." : actionLabel}
              </button>
            </form>

            <div className="relative my-5">
              <div className="h-px bg-slate-200" />
              <span className="absolute inset-x-0 -top-2 text-center text-xs text-slate-400 bg-white w-10 mx-auto">
                or
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70 cursor-pointer"
            >
              Continue with Google
            </button>
          </>
        )}

        {error ? (
          <p className="mt-4 text-xs text-rose-600 break-words" role="alert">
            {error}
          </p>
        ) : null}

        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing, you agree to your platform policy.
        </p>
      </div>
    </div>
  );
}
