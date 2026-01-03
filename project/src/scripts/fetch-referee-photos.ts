#!/usr/bin/env npx tsx

/**
 * Fetch all referee photos from Wikipedia
 */

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const dbPath = path.join(projectRoot, 'dev.db');

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function fetchRefereePhotoFromWikipedia(refereeName: string): Promise<string | null> {
  try {
    // Search for the referee on Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(refereeName + ' referee football')}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.query?.search?.length > 0) {
      const pageTitle = searchData.query.search[0].title;

      // Get the page image
      const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
      const imageResponse = await fetch(imageUrl);
      const imageData = await imageResponse.json();

      const pages = imageData.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
        if (page.thumbnail?.source) {
          return page.thumbnail.source;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  console.log('📸 Fetching all referee photos from Wikipedia...\n');

  const refereesWithoutPhotos = await prisma.referee.findMany({
    where: { photo: null },
    orderBy: { name: 'asc' },
  });

  const totalWithPhoto = await prisma.referee.count({ where: { photo: { not: null } } });

  console.log(`📊 Status: ${totalWithPhoto} with photos, ${refereesWithoutPhotos.length} without photos\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < refereesWithoutPhotos.length; i++) {
    const referee = refereesWithoutPhotos[i];
    process.stdout.write(`[${i + 1}/${refereesWithoutPhotos.length}] ${referee.name}... `);

    const photoUrl = await fetchRefereePhotoFromWikipedia(referee.name);

    if (photoUrl) {
      await prisma.referee.update({
        where: { id: referee.id },
        data: { photo: photoUrl },
      });
      console.log('✅');
      successCount++;
    } else {
      console.log('❌');
      failCount++;
    }

    // Small delay to be nice to Wikipedia
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n📊 Final Summary:');
  console.log(`   ✅ Photos found: ${successCount}`);
  console.log(`   ❌ No photo found: ${failCount}`);
  console.log(`   📸 Total with photos: ${totalWithPhoto + successCount}`);

  await prisma.$disconnect();
}

main();
