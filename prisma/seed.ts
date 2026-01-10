import { PrismaClient } from '@prisma/client';
import { fetchMultipleYears, transformToProject } from '../lib/gsoc-importer';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if projects already exist
  const existingCount = await prisma.project.count();
  if (existingCount > 0) {
    console.log(`✅ Database already has ${existingCount} projects. Skipping seed.`);
    return;
  }

  console.log('📥 Fetching GSOC organizations from API...');

  // Fetch organizations from recent years
  const projects = await fetchMultipleYears([2024, 2023, 2022]);

  console.log(`Found ${projects.length} unique GSOC organizations`);

  // Import projects to database
  let imported = 0;
  let failed = 0;

  for (const project of projects) {
    try {
      await prisma.project.create({
        data: {
          name: project.name,
          description: project.description,
          githubUrl: project.githubUrl || `https://github.com/${project.githubOwner}/${project.githubRepo}`,
          githubOwner: project.githubOwner || 'gsoc',
          githubRepo: project.githubRepo || project.name.toLowerCase().replace(/\s+/g, '-'),
          tags: project.tags || '',
          topics: project.topics || '',
          primaryLanguage: project.primaryLanguage,
          stars: project.stars,
          forks: project.forks,
          openIssuesCount: project.openIssuesCount,
          status: project.status,
          source: project.source,
          gsocYear: project.gsocYear,
          officialWebsite: project.officialWebsite,
          chatUrl: project.chatUrl,
          documentationUrl: project.documentationUrl,
        }
      });
      imported++;

      if (imported % 10 === 0) {
        console.log(`  ✓ Imported ${imported} projects...`);
      }
    } catch (error: any) {
      failed++;
      console.error(`  ✗ Failed to import ${project.name}: ${error.message}`);
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Imported: ${imported} projects`);
  console.log(`   Failed: ${failed} projects`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
