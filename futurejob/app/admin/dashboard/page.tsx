import { Users, Briefcase, ClipboardList, ShieldAlert } from "lucide-react";
import { getAdminDashboardData } from "@/lib/admin/dashboard";
import AdminRefreshButton from "@/components/ui/AdminRefreshButton";

function MetricCard({
  label,
  value,
  icon: Icon,
  helper,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  helper: string;
}) {
  return (
    <div className="glass-card p-5 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function MiniCard({ title, count, tone }: { title: string; count: number; tone: string }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${tone}`}>
      <p className="text-xs uppercase tracking-[0.2em] opacity-70">{title}</p>
      <p className="mt-2 text-2xl font-black">{count}</p>
    </div>
  );
}

function ListPanel({ title, rows }: { title: string; rows: Array<{ id: string; title: string; subtitle: string; meta: string }> }) {
  return (
    <section className="glass-card p-6 border border-slate-200/80 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No records found yet.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="flex items-start justify-between gap-4 rounded-xl bg-slate-50/80 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{row.title}</p>
                <p className="text-sm text-slate-500">{row.subtitle}</p>
              </div>
              <p className="text-xs text-slate-400 shrink-0">{row.meta}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Admin Control Room</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Platform dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Live Firestore counts and recent activity for users, jobs, applications, ratings, and audit logs.
          </p>
        </div>
        <AdminRefreshButton />
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <MetricCard
          label="Total Users"
          value={data.totalUsers}
          icon={Users}
          helper={`Students ${data.roleCounts.student} • Companies ${data.roleCounts.company} • Admins ${data.roleCounts.admin}`}
        />
        <MetricCard
          label="Open Jobs"
          value={data.jobCounts.open}
          icon={Briefcase}
          helper={`Draft ${data.jobCounts.draft} • Closed ${data.jobCounts.closed}`}
        />
        <MetricCard
          label="Applications"
          value={data.totalApplications}
          icon={ClipboardList}
          helper={`Submitted ${data.applicationCounts.submitted} • Reviewing ${data.applicationCounts.reviewing}`}
        />
        <MetricCard
          label="Audit Events"
          value={data.totalAuditLogs}
          icon={ShieldAlert}
          helper={`Ratings stored: ${data.totalRatings}`}
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="glass-card p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick breakdown</h2>
          <div className="grid grid-cols-2 gap-3">
            <MiniCard title="Students" count={data.roleCounts.student} tone="bg-sky-50 text-sky-900 border-sky-100" />
            <MiniCard title="Companies" count={data.roleCounts.company} tone="bg-amber-50 text-amber-900 border-amber-100" />
            <MiniCard title="Admins" count={data.roleCounts.admin} tone="bg-rose-50 text-rose-900 border-rose-100" />
            <MiniCard title="Open Jobs" count={data.jobCounts.open} tone="bg-emerald-50 text-emerald-900 border-emerald-100" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniCard title="Submitted" count={data.applicationCounts.submitted} tone="bg-slate-50 text-slate-900 border-slate-200" />
            <MiniCard title="Approved" count={data.applicationCounts.approved} tone="bg-indigo-50 text-indigo-900 border-indigo-100" />
            <MiniCard title="Rejected" count={data.applicationCounts.rejected} tone="bg-rose-50 text-rose-900 border-rose-100" />
            <MiniCard title="Ratings" count={data.totalRatings} tone="bg-violet-50 text-violet-900 border-violet-100" />
          </div>
        </div>

        <section className="glass-card p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Operational status</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>Users collection is live with {data.totalUsers} documents.</p>
            <p>Jobs are split across draft, open, and closed states for moderation.</p>
            <p>Applications and rating results are being pulled directly from Firestore.</p>
            <p>Audit logs are ready for server-side moderation or future compliance tracking.</p>
          </div>
        </section>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ListPanel title="Recent users" rows={data.recentUsers} />
        <ListPanel title="Recent jobs" rows={data.recentJobs} />
        <ListPanel title="Recent applications" rows={data.recentApplications} />
        <ListPanel title="Recent rating results" rows={data.recentRatings} />
      </section>

      <ListPanel title="Recent audit logs" rows={data.recentAuditLogs} />
    </div>
  );
}