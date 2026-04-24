import { getAdminModerationPageData } from "@/lib/admin/dashboard";
import { VerifyCompanyButton } from "@/components/ui/VerifyCompanyButton";
import { Globe, MapPin, Building2, Calendar } from "lucide-react";

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
        <p className="mt-2 text-slate-500">Review unverified company profiles and audit events.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatBlock label="Unverified Companies" value={data.totalPending} />
        <StatBlock label="Audit Logs" value={data.totalAuditLogs} />
        <StatBlock label="Total Users" value={data.totalUsers} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 glass-card p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Unverified Company Profiles
          </h2>
          {data.pendingApplications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 font-medium">No companies waiting for verification.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.pendingApplications.map((company) => (
                <div key={company.id} className="rounded-2xl bg-slate-50/80 p-6 border border-slate-100 hover:border-indigo-200 transition-colors group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{company.name}</h3>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                          <Building2 className="w-4 h-4" /> {company.industry}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                          <MapPin className="w-4 h-4" /> {company.headquarters}
                        </span>
                        {company.website && company.website !== "-" && (
                          <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline font-medium">
                            <Globe className="w-4 h-4" /> Website
                          </a>
                        )}
                      </div>
                    </div>
                    <VerifyCompanyButton companyId={company.id} />
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-slate-100 mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company About</p>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{company.about !== "-" ? company.about : "No description provided yet."}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    Registered on {company.createdAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Audit Logs</h2>
          {data.recentAuditLogs.length === 0 ? (
            <p className="text-sm text-slate-500">No audit records yet.</p>
          ) : (
            <div className="space-y-4">
              {data.recentAuditLogs.map((item: { id: string; title: string; subtitle: string; meta: string }) => (
                <div key={item.id} className="rounded-xl bg-slate-50/80 px-4 py-3 border border-slate-100/50">
                  <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.subtitle}</p>
                  <p className="mt-2 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">{item.meta}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="glass-card p-4 border border-slate-200/80 shadow-sm text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
        Enterprise Moderation Suite • Secure Verification Layer Active
      </section>
    </div>
  );
}