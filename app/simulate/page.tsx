'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function SimulatePage() {
    const { data: session, status } = useSession();
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [githubUsername, setGithubUsername] = useState('');
    const [eventTitle, setEventTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Simulation state for voting
    const [contributionId, setContributionId] = useState('');
    const [voteCount, setVoteCount] = useState(3);
    const [averageScore, setAverageScore] = useState(4);

    useEffect(() => {
        if (status === 'authenticated') {
            const role = (session?.user as any)?.role;
            if (role !== 'ADMIN') {
                window.location.href = '/dashboard';
            }

            // Fetch projects for dropdown
            fetch('/api/projects')
                .then(res => res.json())
                .then(data => setProjects(data.projects || []));
        }
    }, [session, status]);

    if (status === 'loading') return <div className="text-white">Loading...</div>;
    if (!session) return null;

    const handleCreateEvent = async () => {
        if (!selectedProject || !githubUsername) {
            alert('Please select a project and enter a GitHub username');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_event',
                    data: {
                        projectId: selectedProject,
                        githubUsername,
                        title: eventTitle || `Simulated PR by ${githubUsername}`,
                    },
                }),
            });

            const data = await res.json();
            setResult(data);
            setContributionId(data.event?.id || '');
        } catch (error) {
            console.error(error);
            setResult({ error: 'Failed to create event' });
        }
        setLoading(false);
    };

    const handleAddVotes = async () => {
        if (!contributionId) {
            alert('Please create an event first or enter a contribution ID');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_votes',
                    data: {
                        contributionEventId: contributionId,
                        voteCount,
                        averageScore,
                    },
                }),
            });

            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            setResult({ error: 'Failed to add votes' });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            <div className="glass-card p-8">
                <h1 className="text-4xl font-bold text-white mb-2">Simulation Dashboard</h1>
                <p className="text-slate-400">Test the contribution lifecycle without waiting for real GitHub events.</p>
            </div>

            {/* Step 1: Create Event */}
            <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Step 1: Create Contribution Event</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Select Project</label>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 text-white focus:border-primary focus:outline-none"
                        >
                            <option value="">-- Choose a project --</option>
                            {projects.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-white mb-2">GitHub Username (Contributor)</label>
                        <input
                            type="text"
                            value={githubUsername}
                            onChange={(e) => setGithubUsername(e.target.value)}
                            placeholder="johndoe"
                            className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Event Title (Optional)</label>
                        <input
                            type="text"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="Add authentication feature"
                            className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <button
                        onClick={handleCreateEvent}
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </div>

            {/* Step 2: Add Votes */}
            <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Step 2: Add Votes (Fast-Forward Consensus)</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Contribution Event ID</label>
                        <input
                            type="text"
                            value={contributionId}
                            onChange={(e) => setContributionId(e.target.value)}
                            placeholder="Auto-filled from Step 1"
                            className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Number of Votes</label>
                            <input
                                type="number"
                                value={voteCount}
                                onChange={(e) => setVoteCount(parseInt(e.target.value))}
                                min="1"
                                max="10"
                                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 text-white focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Average Score (1-5)</label>
                            <input
                                type="number"
                                value={averageScore}
                                onChange={(e) => setAverageScore(parseInt(e.target.value))}
                                min="1"
                                max="5"
                                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 text-white focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAddVotes}
                        disabled={loading}
                        className="btn-secondary disabled:opacity-50"
                    >
                        {loading ? 'Adding Votes...' : 'Add Votes'}
                    </button>
                </div>
            </div>

            {/* Result Display */}
            {result && (
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Result</h2>
                    <pre className="bg-black/40 p-4 rounded-lg text-sm text-green-400 overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                    {result.event && (
                        <div className="mt-4">
                            <a
                                href={`/dashboard/contributions`}
                                className="btn-primary inline-block"
                            >
                                View in Contributions Dashboard →
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
