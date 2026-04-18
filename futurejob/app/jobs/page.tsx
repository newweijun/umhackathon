import Link from "next/link";

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Jobs</h1>
        <p className="text-slate-600 mb-8">
          Job listing feed will be connected to Firestore next. For now, sign in to set up your role and continue.
        </p>

        <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Authentication Ready</h2>
            <p className="text-sm text-slate-500">
              Email and Google login are available in the new authentication page.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
