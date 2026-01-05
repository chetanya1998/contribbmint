'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function ProjectSearch({ initialSearch }: { initialSearch: string }) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        replace(`/projects?${params.toString()}`);
    }, 300);

    return (
        <input
            type="text"
            name="search"
            placeholder="Search projects..."
            defaultValue={initialSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64 bg-white/5 text-slate-900 dark:text-white"
        />
    );
}
