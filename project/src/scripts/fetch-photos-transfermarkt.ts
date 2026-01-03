#!/usr/bin/env npx tsx

/**
 * Fetch referee photos from TransferMarkt
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

async function fetchRefereePhotoFromTransfermarkt(refereeName: string): Promise<string | null> {
  try {
    // Search TransferMarkt for the referee
    const searchUrl = `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(refereeName)}&Schiedsrichter=Schiedsrichter`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Find referee image in search results
    // TransferMarkt uses data-src for lazy loading images
    const imgMatch = html.match(/class="bilderrahmen-fixed"[^>]*(?:src|data-src)="([^"]+)"/);

    if (imgMatch && imgMatch[1]) {
      let imgUrl = imgMatch[1];
      // Convert small image to larger version
      imgUrl = imgUrl.replace('/small/', '/header/').replace('/kl/', '/header/');
      // Ensure https
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      if (!imgUrl.includes('default') && !imgUrl.includes('placeholder')) {
        return imgUrl;
      }
    }

    // Try alternative pattern
    const altMatch = html.match(/(?:Schiedsrichter|Referee)[^<]*<[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)="([^"]+)"/i);
    if (altMatch && altMatch[1]) {
      let imgUrl = altMatch[1];
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      if (!imgUrl.includes('default') && !imgUrl.includes('placeholder')) {
        return imgUrl;
      }
    }

    return null;
  } catch {
    return null;
  }
}


// Try multiple sources for a referee photo
async function fetchRefereePhoto(refereeName: string): Promise<string | null> {
  // Try TransferMarkt first
  const photo = await fetchRefereePhotoFromTransfermarkt(refereeName);
  if (photo) return photo;

  // Could add more sources here
  return null;
}

async function main(): Promise<void> {
  console.log('📸 Fetching referee photos from TransferMarkt...\n');

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

    const photoUrl = await fetchRefereePhoto(referee.name);

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

    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n📊 Final Summary:');
  console.log(`   ✅ Photos found: ${successCount}`);
  console.log(`   ❌ No photo found: ${failCount}`);
  console.log(`   📸 Total with photos: ${totalWithPhoto + successCount}`);

  await prisma.$disconnect();
}

main();
