'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ImportGSOCPage() {
    const { data: session } = useSession();
    const [selectedYears, setSelectedYears] = useState<number[]>([2024]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [preview, setPreview] = useState<any[]>([]);

    const role = (session?.user as any)?.role;

    if (role !== 'ADMIN') {
        return (
            <div className="text-center py-20">
                <p className="text-red-400">Access Denied. Admin only.</p>
            </div>
        );
    }

    const years = [2024, 2023, 2022, 2021, 2020, 2019];

    const handleToggleYear = (year: number) => {
        if (selectedYears.includes(year)) {
            setSelectedYears(selectedYears.filter(y => y !== year));
        } else {
            setSelectedYears([...selectedYears, year]);
        }
    };

    const handlePreview = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/gsoc/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ years: selectedYears }),
            });
            const data = await res.json();
            setPreview(data.projects || []);
            setResult({ success: true, message: `Found ${data.projects?.length || 0} organizations` });
        } catch (error) {
            setResult({ error: 'Failed to preview organizations' });
        }
        setLoading(false);
    };

    const handleImport = async () => {
        if (!confirm(`Import ${preview.length} GSOC organizations?`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/gsoc/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projects: preview }),
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            setResult({ error: 'Failed to import organizations' });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto py-8 space-y-8">
            <div className="glass-card p-8">
                <h1 className="text-4xl font-bold text-white mb-2">Import GSOC Organizations</h1>
                <p className="text-slate-400">Fetch real Google Summer of Code organizations and import them as projects</p>
            </div>

            {/* Year Selection */}
            <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Select Years</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {years.map((year) => (
                        <button
                            key={year}
                            onClick={() => handleToggleYear(year)}
                            className={`p-4 rounded-lg border-2 transition-all ${selectedYears.includes(year)
                                    ? 'border-primary bg-primary/20 text-white font-bold'
                                    : 'border-white/10 hover:border-white/30 text-slate-400'
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handlePreview}
                    disabled={loading || selectedYears.length === 0}
                    className="btn-primary mt-6 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Preview Organizations'}
                </button>
            </div>

            {/* Preview Table */}
            {preview.length > 0 && (
                <div className="glass-card p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">
                            Preview ({preview.length} organizations)
                        </h2>
                        <button
                            onClick={handleImport}
                            disabled={loading}
                            className="btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Importing...' : `Import ${preview.length} Projects`}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Name</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Year</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Technologies</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.slice(0, 20).map((project, idx) => (
                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-4 text-white font-medium">{project.name}</td>
                                        <td className="py-3 px-4 text-slate-400">{project.gsocYear}</td>
                                        <td className="py-3 px-4 text-slate-400 text-sm">{project.tags.substring(0, 50)}...</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                                                Ready
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {preview.length > 20 && (
                            <p className="text-slate-500 text-sm mt-4 text-center">
                                Showing first 20 of {preview.length} organizations
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Result</h2>
                    <pre className="bg-black/40 p-4 rounded-lg text-sm text-green-400 overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
