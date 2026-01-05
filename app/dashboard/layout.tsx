import Link from 'next/link';
import { Home, LayoutGrid, Award, Settings, LogOut } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions as any);
    if (!session) redirect('/login');

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 fixed h-full glass-panel border-r border-white/5 hidden md:flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        ContribMint
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem href="/dashboard" icon={<LayoutGrid size={18} />} label="Overview" />
                    <NavItem href="/dashboard/contributions" icon={<Award size={18} />} label="Contributions" />
                    <NavItem href="/dashboard/settings" icon={<Settings size={18} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:text-white transition-colors">
                        <Home size={18} />
                        Back to Home
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-white/5 hover:text-white transition-all"
        >
            {icon}
            {label}
        </Link>
    );
}
