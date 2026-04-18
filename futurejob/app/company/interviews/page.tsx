export default function Interviews() {
  return (
    <div className="min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Interview Sessions</h1>
        <p className="text-slate-500">Manage your upcoming meetings with approved candidates.</p>
      </header>

      <div className="flex-1 glass-card p-4 md:p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Interviews</h2>
        <p className="text-slate-500 max-w-sm mb-6">You haven&apos;t approved any candidates yet. Go to your dashboard to review pending applications.</p>
        <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
