import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canManageProjects } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { fetchRepoMetadata, fetchRecentIssues, fetchRecentPulls } from '@/lib/github';
import { ContributionEventType } from '@prisma/client';
import { recomputeReputation } from '@/lib/insights';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!canManageProjects(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const metadata = await fetchRepoMetadata(project.githubUrl);
    const pulls = await fetchRecentPulls(project.githubOwner, project.githubRepo);
    const issues = await fetchRecentIssues(project.githubOwner, project.githubRepo);

    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: project.id },
        data: {
          ...metadata,
          lastPushedAt: metadata.lastPushedAt ? new Date(metadata.lastPushedAt) : undefined,
          lastSyncedAt: new Date(),
          tags: metadata.topics || [],
          topics: metadata.topics || [],
        },
      });

      const events = [
        ...pulls.map((pr: any) => ({
          projectId: project.id,
          eventType: ContributionEventType.PR_MERGED,
          actorGithubUsername: pr.user?.login || 'unknown',
          targetId: String(pr.number),
          title: pr.title,
          url: pr.html_url,
          occurredAt: new Date(pr.closed_at || pr.merged_at || new Date()),
        })),
        ...issues.map((issue: any) => ({
          projectId: project.id,
          eventType: ContributionEventType.ISSUE_CLOSED,
          actorGithubUsername: issue.user?.login || 'unknown',
          targetId: String(issue.number),
          title: issue.title,
          url: issue.html_url,
          occurredAt: new Date(issue.closed_at || new Date()),
        })),
      ];
      await tx.contributionEvent.createMany({ data: events.slice(0, 100) });
    });

    await recomputeReputation(project.id);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: 'Sync failed. GitHub API might be limited.' }, { status: 400 });
  }
}
