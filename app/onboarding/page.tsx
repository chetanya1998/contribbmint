import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const roles = [
  { value: 'CONTRIBUTOR', label: 'Contributor', description: 'Track your reputation and discover opportunities.' },
  { value: 'SPONSOR', label: 'Sponsor', description: 'Monitor impact across sponsored projects.' },
];

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions as any);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect('/login');

  async function selectRole(formData: FormData) {
    'use server';
    const role = formData.get('role') as string;
    await prisma.user.update({ where: { id: userId }, data: { role } as any });
    redirect('/dashboard');
  }

  return (
    <div className="max-w-3xl mx-auto card p-6 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Choose your role</h1>
        <p className="text-sm text-slate-600">Tell us how you plan to use ContribMint. Admins and maintainers are assigned by the platform team.</p>
      </div>
      <form action={selectRole} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roles.map((role) => (
          <button
            key={role.value}
            name="role"
            value={role.value}
            className="card p-4 text-left hover:border-accent"
            type="submit"
          >
            <p className="text-lg font-semibold">{role.label}</p>
            <p className="text-sm text-slate-600">{role.description}</p>
          </button>
        ))}
      </form>
    </div>
  );
}
