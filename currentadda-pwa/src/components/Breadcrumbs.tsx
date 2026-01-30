'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    name: string;
    item: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    if (!items || items.length <= 1) return null;

    return (
        <nav className="flex mb-6 overflow-x-auto no-scrollbar py-2" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
                {items.map((item, index) => (
                    <li key={item.item} className="inline-flex items-center">
                        {index > 0 && (
                            <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0" />
                        )}
                        <Link
                            href={item.item}
                            className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors ${index === items.length - 1
                                    ? 'text-slate-900 pointer-events-none'
                                    : 'text-slate-400'
                                }`}
                        >
                            {index === 0 && <Home className="w-3 h-3 mr-2" />}
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
