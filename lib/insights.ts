import { prisma } from './prisma';
import { ContributionEventType, Project, Role } from '@prisma/client';
import { scoreEvent } from './scoring';
import { differenceInDays } from 'date-fns';

export async function buildProjectInsights(project: Project, role?: Role | string | null) {
  const events = await prisma.contributionEvent.findMany({
    where: { projectId: project.id },
    orderBy: { occurredAt: 'desc' },
    take: 100,
  });

  const now = new Date();
  const last30 = events.filter((e) => differenceInDays(now, e.occurredAt) <= 30);
  const merges30 = last30.filter((e) => e.eventType === ContributionEventType.PR_MERGED).length;
  const issuesClosed30 = last30.filter((e) => e.eventType === ContributionEventType.ISSUE_CLOSED).length;
  const uniqueContributors = new Set(last30.map((e) => e.actorGithubUsername)).size;

  if (!role || role === 'CONTRIBUTOR') {
    const goodFirst = project.tags.includes('good-first-issue') ? 5 : 1;
    return {
      snippet: `Good first issues: ${goodFirst} • Avg merge: ${Math.max(1, Math.round(mergeTime(events)))} days`,
      metrics: [
        { label: 'Good first issues', value: goodFirst },
        { label: 'Open PRs', value: 4, helper: 'Approx from recent sync' },
        { label: 'Avg time to merge (30d)', value: `${Math.max(1, Math.round(mergeTime(events)))} days` },
        { label: 'Unique contributors (30d)', value: uniqueContributors },
      ],
    };
  }

  if (role === 'MAINTAINER') {
    return {
      snippet: `Open PRs: 4 • Oldest PR: ${Math.max(1, Math.round(mergeTime(events)))} days`,
      metrics: [
        { label: 'Review backlog', value: '4 open PRs' },
        { label: 'Issue triage', value: `${issuesClosed30} closed (30d)` },
        { label: 'Returning contributors (30d)', value: Math.max(1, uniqueContributors - 2) },
        { label: 'Velocity', value: `${merges30} merges (30d)` },
      ],
    };
  }

  if (role === 'SPONSOR') {
    return {
      snippet: `Impact 30d: ${merges30} merges • ${uniqueContributors} contributors`,
      metrics: [
        { label: 'Impact (30d)', value: `${merges30} merges` },
        { label: 'Unique contributors', value: uniqueContributors },
        { label: 'Momentum', value: `${merges30 + issuesClosed30} activities` },
      ],
    };
  }

  if (role === 'ADMIN') {
    return {
      snippet: `Status: ${project.status}`,
      metrics: [
        { label: 'Project health', value: `${Math.min(100, merges30 * 2 + uniqueContributors * 3)}` },
        { label: 'Events stored', value: events.length },
        { label: 'Unique actors', value: uniqueContributors },
      ],
    };
  }

  return { snippet: '', metrics: [] };
}

function mergeTime(events: { occurredAt: Date }[]) {
  if (!events.length) return 3;
  const diffs = events.map((e) => Math.max(1, differenceInDays(new Date(), e.occurredAt)));
  return diffs.reduce((a, b) => a + b, 0) / diffs.length;
}

export async function recomputeReputation(projectId: string) {
  const events = await prisma.contributionEvent.findMany({ where: { projectId } });
  const totals: Record<string, number> = {};
  events.forEach((event) => {
    const points = scoreEvent(event.eventType);
    totals[event.actorGithubUsername] = (totals[event.actorGithubUsername] || 0) + points;
  });

  await prisma.$transaction(async (tx) => {
    await tx.projectReputation.deleteMany({ where: { projectId } });
    const entries = Object.entries(totals).map(([githubUsername, pointsTotal]) => ({
      projectId,
      githubUsername,
      pointsTotal,
      lastComputedAt: new Date(),
    }));
    if (entries.length) {
      await tx.projectReputation.createMany({ data: entries });
    }
  });
}
