export default function Messages() {
  return (
    <div className="min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500">
          Keep in touch with your approved applicants.
        </p>
      </header>

      <div className="flex-1 glass-card flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Contacts */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 p-4 shrink-0 md:shrink">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
            Recent
          </div>
          {/* Mock Contact */}
          <div className="p-3 rounded-lg bg-white border border-indigo-100 shadow-sm cursor-pointer mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              SL
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">
                Sarah Lee
              </div>
              <div className="text-xs text-slate-500 truncate">
                Looking forward to the interview!
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 md:p-8 min-h-[300px]">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Select a conversation
          </h2>
          <p className="text-slate-500 max-w-sm">
            Choose an applicant from the left sidebar to start keeping in touch.
          </p>
        </div>
      </div>
    </div>
  );
}
