import { getAdminUsersPageData } from "@/lib/admin/dashboard";

function Badge({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{children}</span>;
}

export default async function AdminUsersPage() {
  const data = await getAdminUsersPageData();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Admin Users</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Users</h1>
          <p className="mt-2 text-slate-500">Live Firestore user records and role distribution.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {data.totalUsers} total users
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass-card p-5"><p className="text-sm text-slate-500">Students</p><p className="mt-2 text-3xl font-black text-slate-900">{data.counts.student ?? 0}</p></div>
        <div className="glass-card p-5"><p className="text-sm text-slate-500">Companies</p><p className="mt-2 text-3xl font-black text-slate-900">{data.counts.company ?? 0}</p></div>
        <div className="glass-card p-5"><p className="text-sm text-slate-500">Admins</p><p className="mt-2 text-3xl font-black text-slate-900">{data.counts.admin ?? 0}</p></div>
      </section>

      <section className="glass-card p-6 border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-700">UID</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Role</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Provider</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Created</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{user.email}</td>
                  <td className="px-4 py-3 text-slate-500">{user.uid}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        user.role === "admin"
                          ? "bg-rose-50 text-rose-700"
                          : user.role === "company"
                            ? user.isVerified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-sky-50 text-sky-700"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{user.provider}</td>
                  <td className="px-4 py-3 text-slate-500">{user.createdAt}</td>
                  <td className="px-4 py-3 text-slate-500">{user.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}