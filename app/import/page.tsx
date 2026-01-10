import { authOptions } from '@/lib/auth';
import { canManageProjects } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ImportPage() {
  const session = await getServerSession(authOptions as any);
  const role = (session?.user as any)?.role;
  if (!canManageProjects(role)) redirect('/projects');

  async function importAction(formData: FormData) {
    'use server';
    const repoUrl = formData.get('repoUrl') as string;
    if (!repoUrl) return;
    await prisma.project.create({
      data: {
        githubOwner: repoUrl.split('github.com/')[1].split('/')[0],
        githubRepo: repoUrl.split('github.com/')[1].split('/')[1],
        githubUrl: repoUrl,
        name: repoUrl.split('/').slice(-1)[0],
        description: 'Imported project pending sync',
        topics: '',
        tags: '',
        lastSyncedAt: null,
      },
    });
    redirect('/dashboard');
  }

  return (
    <div className="max-w-2xl mx-auto glass-card p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Import Repository</h1>
        <p className="text-sm text-slate-400 mt-2">Paste a GitHub URL to add a project. Admin approval required before listing.</p>
      </div>
      <form action={importAction} className="flex flex-col gap-4">
        <label className="text-sm font-bold text-white">GitHub Repository URL</label>
        <input name="repoUrl" required placeholder="https://github.com/org/repo" className="px-4 py-3 border border-white/10 rounded-lg bg-white/5 text-white placeholder-slate-500 focus:border-primary focus:outline-none transition-colors" />
        <button type="submit" className="btn-primary w-fit">Import Project</button>
      </form>
    </div>
  );
}
