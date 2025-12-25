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
        topics: [],
        tags: [],
        lastSyncedAt: null,
      },
    });
    redirect('/dashboard');
  }

  return (
    <div className="max-w-2xl mx-auto card p-6 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Import a GitHub repository</h1>
        <p className="text-sm text-slate-600">Create a pending project by pasting a GitHub URL. Admin approval required before listing.</p>
      </div>
      <form action={importAction} className="flex flex-col gap-3">
        <label className="text-sm font-medium">GitHub repo URL</label>
        <input name="repoUrl" required placeholder="https://github.com/org/repo" className="px-3 py-2 border rounded-lg" />
        <button type="submit" className="px-4 py-2 rounded-full bg-accent text-white text-sm font-medium w-fit">Import project</button>
      </form>
    </div>
  );
}
