export default function QuizLoading() {
    return (
        <div className="max-w-xl mx-auto px-5 py-4 min-h-screen animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-12 bg-slate-200 rounded" />
                <div className="h-3 w-3 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
            </div>

            {/* Question dots skeleton */}
            <div className="flex items-center justify-center gap-1 mb-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`h-2 rounded-full bg-slate-200 ${i === 0 ? 'w-8' : 'w-2'}`} />
                ))}
            </div>

            {/* Header skeleton */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="w-6 h-6 bg-slate-200 rounded-lg" />
                <div className="flex items-center gap-4 flex-1 px-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                        <div className="h-3 w-32 bg-slate-200 rounded" />
                    </div>
                </div>
            </div>

            {/* Question skeleton */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="h-5 w-20 bg-indigo-100 rounded-xl" />
                    <div className="h-6 w-full bg-slate-200 rounded-lg" />
                    <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                </div>

                {/* Options skeleton */}
                <div className="grid gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 rounded-2xl border-2 border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100" />
                            <div className="h-4 bg-slate-100 rounded flex-1" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom nav skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-5">
                <div className="max-w-xl mx-auto flex justify-between gap-3">
                    <div className="h-12 flex-1 bg-slate-200 rounded-2xl" />
                    <div className="h-12 flex-1 bg-indigo-200 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
