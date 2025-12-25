import clsx from 'clsx';

type Role = 'CONTRIBUTOR' | 'MAINTAINER' | 'SPONSOR' | 'ADMIN' | undefined;

export function RoleBadge({ role }: { role: Role }) {
  if (!role) return null;
  const color = {
    CONTRIBUTOR: 'bg-blue-50 text-blue-700 border-blue-200',
    MAINTAINER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SPONSOR: 'bg-amber-50 text-amber-700 border-amber-200',
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
  }[role];

  return <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold border', color)}>{role}</span>;
}
