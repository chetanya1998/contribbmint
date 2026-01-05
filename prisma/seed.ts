import { PrismaClient } from '@prisma/client';
import { Role, ProjectStatus, ContributionEventType, MemberRole } from '../types/enums';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'contributor@demo.com' },
    update: {},
    create: {
      email: 'contributor@demo.com',
      name: 'Alice Contributor',
      githubUsername: 'alice-dev',
      role: 'CONTRIBUTOR',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Standard Hardhat Account #1
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'maintainer@demo.com' },
    update: {},
    create: {
      email: 'maintainer@demo.com',
      name: 'Bob Maintainer',
      githubUsername: 'bob-maintainer',
      role: 'MAINTAINER',
    },
  });

  // 2. Create Projects
  const projects = [];
  for (let i = 0; i < 6; i++) {
    const p = await prisma.project.create({
      data: {
        name: `Open Source Tool ${i + 1}`,
        githubOwner: 'open-source',
        githubRepo: `project-${i + 1}`,
        githubUrl: `https://github.com/open-source/project-${i + 1}`,
        description: 'Sample project for ContribMint demo.',
        primaryLanguage: ['TypeScript', 'Python', 'Go'][i % 3],
        topics: ['open-source', 'demo', i % 2 ? 'good-first-issue' : 'contrib'].join(','),
        tags: ['open-source', 'demo'].join(','),
        stars: 100 + i * 20,
        forks: 20 + i * 3,
        openIssuesCount: 5 + i,
        status: ProjectStatus.APPROVED,
        lastSyncedAt: new Date(),
      },
    });
    projects.push(p);
  }

  // 3. Create Interactions (Memberships, Events)
  await prisma.projectMember.create({
    data: {
      projectId: projects[0].id,
      userId: user2.id,
      roleInProject: 'MAINTAINER',
    },
  });

  // Recent Contributions
  const events = [
    {
      projectId: projects[0].id,
      eventType: ContributionEventType.PR_MERGED,
      actorGithubUsername: 'alice-dev',
      targetId: '101',
      title: 'Fix responsive layout bug',
      url: 'https://github.com/example/repo/pull/101',
      occurredAt: subDays(new Date(), 2),
      metadata: { linesAdded: 50, linesDeleted: 20 },
      mintStatus: 'PENDING_VOTE'
    },
    {
      projectId: projects[1].id,
      eventType: ContributionEventType.PR_MERGED,
      actorGithubUsername: 'alice-dev',
      targetId: '205',
      title: 'Add new API endpoint',
      url: 'https://github.com/example/repo/pull/205',
      occurredAt: subDays(new Date(), 5),
      metadata: { linesAdded: 120, linesDeleted: 5 },
      mintStatus: 'READY_TO_MINT'
    }
  ];

  for (const e of events) {
    await prisma.contributionEvent.create({
      data: {
        ...e,
        metadata: JSON.stringify(e.metadata)
      }
    })
  }

  // Aggregate scores (Dummy logic fix for type error)
  // Actual aggregation logic isn't needed for seed, just creating data.

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
