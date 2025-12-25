import { PrismaClient, Role, ProjectStatus, ContributionEventType, MemberRole } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  await prisma.contributionEvent.deleteMany();
  await prisma.projectReputation.deleteMany();
  await prisma.sponsorship.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const users = await prisma.user.createMany({
    data: Array.from({ length: 20 }).map((_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      githubUsername: `user${i + 1}`,
      avatarUrl: '',
      role: i === 0 ? Role.ADMIN : i < 3 ? Role.MAINTAINER : i < 6 ? Role.SPONSOR : Role.CONTRIBUTOR,
    })),
  });

  const userRecords = await prisma.user.findMany();

  const projects = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.project.create({
        data: {
          name: `Project ${i + 1}`,
          githubOwner: 'open-source',
          githubRepo: `project-${i + 1}`,
          githubUrl: `https://github.com/open-source/project-${i + 1}`,
          description: 'Sample project for ContribMint demo.',
          primaryLanguage: ['TypeScript', 'Python', 'Go'][i % 3],
          topics: ['open-source', 'demo', i % 2 ? 'good-first-issue' : 'contrib'],
          tags: ['open-source', 'demo'],
          stars: 100 + i * 20,
          forks: 20 + i * 3,
          openIssuesCount: 5 + i,
          status: i < 8 ? ProjectStatus.APPROVED : ProjectStatus.PENDING,
          lastPushedAt: subDays(new Date(), i),
          lastSyncedAt: subDays(new Date(), i),
        },
      })
    )
  );

  for (const project of projects) {
    const maintainer = userRecords.find((u) => u.role === Role.MAINTAINER);
    if (maintainer) {
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: maintainer.id,
          roleInProject: MemberRole.MAINTAINER,
        },
      });
    }

    const events = Array.from({ length: 50 }).map((_, idx) => ({
      projectId: project.id,
      eventType: idx % 3 === 0 ? ContributionEventType.PR_MERGED : idx % 3 === 1 ? ContributionEventType.ISSUE_CLOSED : ContributionEventType.REVIEW_APPROVED,
      actorGithubUsername: userRecords[(idx + project.stars) % userRecords.length].githubUsername || 'user1',
      targetId: String(idx + 1),
      title: `${project.name} event #${idx + 1}`,
      url: `${project.githubUrl}/pull/${idx + 1}`,
      occurredAt: subDays(new Date(), idx % 30),
      metadata: {},
    }));
    await prisma.contributionEvent.createMany({ data: events });
  }

  const reputations = await prisma.contributionEvent.groupBy({
    by: ['projectId', 'actorGithubUsername'],
    _sum: { id: true },
  });

  await prisma.projectReputation.createMany({
    data: reputations.map((rep) => ({
      projectId: rep.projectId,
      githubUsername: rep.actorGithubUsername,
      pointsTotal: Math.floor(Math.random() * 120),
    })),
  });

  const sponsor = userRecords.find((u) => u.role === Role.SPONSOR);
  if (sponsor) {
    await prisma.sponsorship.create({ data: { projectId: projects[0].id, sponsorUserId: sponsor.id } });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
