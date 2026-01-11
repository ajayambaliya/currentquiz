export default function Loading() {
    return (
        <main className="min-h-screen bg-slate-50 max-w-xl mx-auto pb-20 overflow-hidden">
            {/* Header Skeleton */}
            <div className="bg-white px-4 py-4 flex justify-between items-center border-b border-slate-100 animate-pulse">
                <div className="flex items-center gap-2">
                    <div className="bg-slate-200 w-10 h-10 rounded-xl" />
                    <div className="bg-slate-200 w-24 h-6 rounded-lg" />
                </div>
            </div>

            {/* Hero Skeleton */}
            <div className="bg-indigo-600/10 h-48 flex flex-col justify-center px-6 animate-pulse">
                <div className="bg-indigo-200 w-3/4 h-8 rounded-lg mb-4" />
                <div className="bg-indigo-100 w-1/2 h-4 rounded-lg" />
            </div>

            {/* Quiz List Skeleton */}
            <div className="px-4 -mt-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center animate-pulse">
                        <div className="space-y-3 flex-1">
                            <div className="bg-slate-100 w-20 h-3 rounded-full" />
                            <div className="bg-slate-100 w-4/5 h-5 rounded-lg" />
                        </div>
                        <div className="bg-slate-50 w-10 h-10 rounded-full" />
                    </div>
                ))}
            </div>
        </main>
    );
}
