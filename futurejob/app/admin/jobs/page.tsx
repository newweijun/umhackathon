import { getAdminJobsPageData } from "@/lib/admin/dashboard";

function Badge({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{children}</span>;
}

export default async function AdminJobsPage() {
  const data = await getAdminJobsPageData();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Admin Jobs</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Jobs</h1>
          <p className="mt-2 text-slate-500">Live Firestore job inventory with status distribution.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {data.totalJobs} total jobs
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass-card p-5"><p className="text-sm text-slate-500">Draft</p><p className="mt-2 text-3xl font-black text-slate-900">{data.counts.draft ?? 0}</p></div>
        <div className="glass-card p-5"><p className="text-sm text-slate-500">Open</p><p className="mt-2 text-3xl font-black text-slate-900">{data.counts.open ?? 0}</p></div>
        <div className="glass-card p-5"><p className="text-sm text-slate-500">Closed</p><p className="mt-2 text-3xl font-black text-slate-900">{data.counts.closed ?? 0}</p></div>
      </section>

      <section className="glass-card p-6 border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Title</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Company</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{job.title}</td>
                  <td className="px-4 py-3 text-slate-500">{job.companyId}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        job.status === "open"
                          ? "bg-emerald-50 text-emerald-700"
                          : job.status === "closed"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-amber-50 text-amber-700"
                      }
                    >
                      {job.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{job.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}