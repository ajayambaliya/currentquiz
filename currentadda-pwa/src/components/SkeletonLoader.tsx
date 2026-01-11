import { motion } from 'framer-motion';

export function QuizCardSkeleton() {
    return (
        <div className="block bg-white p-5 rounded-[1.75rem] border border-slate-100 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <div className="h-2 bg-slate-200 rounded w-24" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
                <div className="bg-slate-100 p-3.5 rounded-xl flex-shrink-0">
                    <div className="w-5 h-5 bg-slate-200 rounded" />
                </div>
            </div>
        </div>
    );
}

export function QuizListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 mb-4 opacity-40">
                <div className="w-4 h-4 bg-slate-200 rounded" />
                <div className="h-2 bg-slate-200 rounded w-32" />
            </div>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <QuizCardSkeleton />
                </motion.div>
            ))}
        </div>
    );
}

export function LeaderboardSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="space-y-1">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl animate-pulse"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-slate-200 rounded-full" />
                        <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-32" />
                            <div className="h-2 bg-slate-100 rounded w-24" />
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-12 ml-auto" />
                        <div className="h-2 bg-slate-100 rounded w-16" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

export function SearchBarSkeleton() {
    return (
        <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-slate-200/40 mb-10 border border-slate-100 animate-pulse">
            <div className="relative">
                <div className="w-full h-14 bg-slate-100 rounded-[1.25rem]" />
            </div>
            <div className="mt-5">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-10 w-20 bg-slate-100 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <section className="relative bg-white px-6 pt-10 pb-16 overflow-hidden animate-pulse">
            <div className="max-w-xl mx-auto text-center space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-100 rounded-full mx-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <div className="h-2 bg-slate-300 rounded w-32" />
                </div>
                <div className="space-y-3">
                    <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto" />
                    <div className="h-8 bg-slate-200 rounded w-2/3 mx-auto" />
                </div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
            </div>
        </section>
    );
}
