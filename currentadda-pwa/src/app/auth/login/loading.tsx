export default function LoginLoading() {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8 animate-pulse">
                    <div className="text-center space-y-4">
                        <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto" />
                        <div className="space-y-2">
                            <div className="h-7 bg-slate-200 rounded w-40 mx-auto" />
                            <div className="h-4 bg-slate-100 rounded w-48 mx-auto" />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-24 ml-1" />
                            <div className="h-14 bg-slate-100 rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-20 ml-1" />
                            <div className="h-14 bg-slate-100 rounded-2xl" />
                        </div>
                        <div className="h-14 bg-indigo-200 rounded-2xl" />
                    </div>

                    <div className="h-4 bg-slate-100 rounded w-48 mx-auto" />
                </div>
            </div>
        </main>
    );
}
