import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect('/api/auth/signin');

  async function updateRole(formData: FormData) {
    'use server';
    const role = formData.get('role') as string;
    const userId = (session?.user as any)?.id;

    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    redirect('/dashboard');
  }

  return (
    <div className="max-w-md mx-auto mt-20 glass-card p-8">
      <h1 className="text-3xl font-bold mb-2 text-white">Welcome to ContribMint</h1>
      <p className="mb-8 text-slate-400">Select your primary role to get started.</p>

      <form action={updateRole} className="flex flex-col gap-4">
        <button name="role" value="CONTRIBUTOR" className="p-4 border border-white/10 rounded-xl hover:bg-white/5 text-left transition-colors">
          <span className="block font-bold text-white">Contributor</span>
          <span className="text-sm text-slate-400">I want to contribute code and earn rewards.</span>
        </button>
        <button name="role" value="MAINTAINER" className="p-4 border border-white/10 rounded-xl hover:bg-white/5 text-left transition-colors">
          <span className="block font-bold text-white">Maintainer</span>
          <span className="text-sm text-slate-400">I own a project and want to incentivize contributions.</span>
        </button>
        <button name="role" value="SPONSOR" className="p-4 border border-white/10 rounded-xl hover:bg-white/5 text-left transition-colors">
          <span className="block font-bold text-white">Sponsor</span>
          <span className="text-sm text-slate-400">I want to fund open source projects.</span>
        </button>
      </form>
    </div>
  );
}
