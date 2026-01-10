'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { RoleBadge } from '@/components/role-badge';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const links = [
  { href: '/projects', label: 'Projects' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/contributions', label: 'Contributions' },
  { href: '/import', label: 'Import Project' },
];

const adminLinks = [
  { href: '/simulate', label: 'Simulate', adminOnly: true },
];

export function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as any;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#141415]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
            <span className="text-primary">✦</span> ContribMint
          </Link>
          <nav className="hidden sm:flex items-center gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${pathname.startsWith(link.href) ? 'text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {link.label}
              </Link>
            ))}
            {role === 'ADMIN' && adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all duration-200 border border-primary/30 ${pathname.startsWith(link.href) ? 'text-white font-bold bg-primary/20' : 'text-primary hover:text-white hover:bg-primary/10'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <ConnectButton showBalance={false} accountStatus="avatar" />
          {session ? (
            <div className="flex items-center gap-3">
              <RoleBadge role={role} />
              <button
                onClick={() => signOut()}
                className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm font-medium transition-colors"
              >
                Sign out
              </button>
            </div>

          ) : (
            <Link href="/login" className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm font-medium transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
