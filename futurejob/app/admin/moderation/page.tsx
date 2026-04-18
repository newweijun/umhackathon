import { getAdminModerationPageData } from "@/lib/admin/dashboard";

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}

export default async function AdminModerationPage() {
  const data = await getAdminModerationPageData();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Admin Moderation</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Moderation</h1>
        <p className="mt-2 text-slate-500">Review queue and recent audit events pulled from Firestore.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatBlock label="Pending Queue" value={data.totalPending} />
        <StatBlock label="Audit Logs" value={data.totalAuditLogs} />
        <StatBlock label="Users" value={data.totalUsers} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="glass-card p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending applications</h2>
          {data.pendingApplications.length === 0 ? (
            <p className="text-sm text-slate-500">No pending applications right now.</p>
          ) : (
            <div className="space-y-4">
              {data.pendingApplications.map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-50/80 px-4 py-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.subtitle}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.meta}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent audit logs</h2>
          {data.recentAuditLogs.length === 0 ? (
            <p className="text-sm text-slate-500">No audit records yet.</p>
          ) : (
            <div className="space-y-4">
              {data.recentAuditLogs.map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-50/80 px-4 py-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.subtitle}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.meta}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="glass-card p-6 border border-slate-200/80 shadow-sm text-sm text-slate-600">
        Admin moderation is now data-driven. Hook approval/rejection actions into server mutations next.
      </section>
    </div>
  );
}