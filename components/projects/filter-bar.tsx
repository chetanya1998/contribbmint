'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const search = params.get('search') || '';
  const sort = params.get('sort') || 'stars';
  const language = params.get('language') || '';
  const needsContributors = params.get('needsContributors') || '';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };

  const sortOptions = useMemo(
    () => [
      { value: 'stars', label: 'Most stars' },
      { value: 'updated', label: 'Recently updated' },
      { value: 'active', label: 'Most active' },
    ],
    []
  );

  return (
    <div className="card p-4 mb-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          defaultValue={search}
          placeholder="Search projects"
          onChange={(e) => setParam('search', e.target.value)}
          className="w-full sm:w-1/2 px-3 py-2 border rounded-lg"
        />
        <select
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
          className="px-3 py-2 border rounded-lg w-full sm:w-48"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center text-sm">
        <input
          defaultValue={language}
          placeholder="Language"
          onChange={(e) => setParam('language', e.target.value)}
          className="px-3 py-2 border rounded-lg w-full sm:w-48"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={needsContributors === 'true'}
            onChange={(e) => setParam('needsContributors', e.target.checked ? 'true' : '')}
          />
          Needs contributors
        </label>
      </div>
    </div>
  );
}
