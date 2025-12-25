'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { RoleBadge } from '@/components/role-badge';

const links = [
  { href: '/projects', label: 'Projects' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/import', label: 'Import Project' },
];

export function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold text-lg text-slate-900">
            ContribMint
          </Link>
          <nav className="hidden sm:flex items-center gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1 rounded-full hover:bg-slate-100 ${pathname.startsWith(link.href) ? 'bg-slate-100 font-medium' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {session ? (
            <div className="flex items-center gap-3">
              <RoleBadge role={role} />
              <button
                onClick={() => signOut()}
                className="px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-100"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-100">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
