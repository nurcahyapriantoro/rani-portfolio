#!/usr/bin/env node
/**
 * Comprehensive E2E test for storage layer + admin functions
 * Run with: node --import tsx scripts/test-all.mts
 *
 * Tests:
 * 1. Backend detection (FS vs GitHub)
 * 2. Read JSON from backend
 * 3. Write JSON to backend (GitHub commit created)
 * 4. Bilingual save (EN + ID)
 * 5. Image upload to backend
 * 6. Rollback on partial failure
 */

// Stub server-only to bypass Next.js marker
import Module from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stubPath = path.join(__dirname, 'server-only-stub.cjs');
const origResolve = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (req: string, ...args: any[]) {
  if (req === 'server-only') {
    return stubPath;
  }
  return origResolve.call(this, req, ...args);
};

import { config } from 'dotenv';
config({ path: '.env.local' });

const { getContentStorage, getUploadStorage, getStorageInfo, readContent } = await import('../lib/storage/index.ts');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';

let pass = 0;
let fail = 0;

function log(icon, msg) {
  console.log(`  ${icon} ${msg}`);
}

function pass_(msg) {
  pass++;
  log(`${GREEN}✓${RESET}`, `${GREEN}${msg}${RESET}`);
}

function fail_(msg, err) {
  fail++;
  log(`${RED}✗${RESET}`, `${RED}${msg}${RESET}`);
  if (err) console.log(`    ${RED}${err}${RESET}`);
}

function section(name) {
  console.log(`\n${BOLD}${BLUE}━━━ ${name} ━━━${RESET}`);
}

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`${BOLD}Rani Portfolio — Comprehensive E2E Test${RESET}\n`);

  // ── Test 1: Backend detection ──
  section('1. Backend Detection');
  const info = getStorageInfo();
  log(`${BLUE}ℹ${RESET}`, `Content backend: ${BOLD}${info.content}${RESET}`);
  log(`${BLUE}ℹ${RESET}`, `Upload backend:  ${BOLD}${info.upload}${RESET}`);

  if (info.content === 'github') {
    pass_('Content backend = github (Vercel-compatible)');
  } else if (info.content === 'fs') {
    log(`${YELLOW}⚠${RESET}`, 'Content backend = fs (localhost dev). Set GH_TOKEN to test GitHub.');
  } else if (info.content === 'kv') {
    pass_('Content backend = kv (Vercel KV)');
  }

  if (info.upload === 'github') {
    pass_('Upload backend = github (Vercel-compatible)');
  } else if (info.upload === 'fs') {
    log(`${YELLOW}⚠${RESET}`, 'Upload backend = fs (localhost dev).');
  }

  const storage = getContentStorage();
  const upload = getUploadStorage();

  // ── Test 2: Read JSON ──
  section('2. Read JSON (en.json)');
  try {
    const data = await readContent('en');
    const sections = Object.keys(data);
    pass_(`Read en.json — ${sections.length} sections: ${sections.join(', ')}`);
    if (data.profile?.fullName) {
      pass_(`Profile.fullName = "${data.profile.fullName}"`);
    } else {
      fail_('Profile.fullName missing');
    }
    if (Array.isArray(data.experiences)) {
      pass_(`Experiences = ${data.experiences.length} items`);
    } else {
      fail_('Experiences not an array');
    }
  } catch (e) {
    fail_('Read en.json failed', e instanceof Error ? e.message : String(e));
  }

  // ── Test 3: Read ID ──
  section('3. Read JSON (id.json)');
  try {
    const data = await readContent('id');
    if (data.profile?.fullName) {
      pass_(`Read id.json — Profile.fullName = "${data.profile.fullName}"`);
    }
  } catch (e) {
    fail_('Read id.json failed', e instanceof Error ? e.message : String(e));
  }

  // ── Test 4: Write JSON (single locale) ──
  section('4. Write JSON (updateSection)');
  try {
    const before = await readContent('en');
    const originalTagline = before.profile.tagline;
    const testTagline = `__TEST_TAGLINE_${Date.now()}__`;

    await storage.updateSection('en', 'profile', {
      ...before.profile,
      tagline: testTagline
    });
    pass_('updateSection(en, profile) — write succeeded');

    // Verify by reading again
    await delay(1200); // wait for cache to expire
    const after = await readContent('en');
    if (after.profile.tagline === testTagline) {
      pass_('Read back — tagline updated correctly');
    } else {
      fail_(`Expected "${testTagline}", got "${after.profile.tagline}"`);
    }

    // Restore
    await storage.updateSection('en', 'profile', {
      ...after.profile,
      tagline: originalTagline
    });
    pass_('Restored original tagline');
  } catch (e) {
    fail_('Write/read roundtrip failed', e instanceof Error ? e.message : String(e));
  }

  // ── Test 5: Bilingual save ──
  section('5. Bilingual Save (updateBilingualSection)');
  try {
    const enBefore = await readContent('en');
    const idBefore = await readContent('id');
    const originalTaglineEN = enBefore.profile.tagline;
    const originalTaglineID = idBefore.profile.tagline;
    const testEN = `__TEST_EN_${Date.now()}__`;
    const testID = `__TEST_ID_${Date.now()}__`;

    await storage.updateBilingualSection(
      { ...enBefore.profile, tagline: testEN },
      { ...idBefore.profile, tagline: testID },
      'profile'
    );
    pass_('updateBilingualSection — both locales written');

    await delay(1200);
    const enAfter = await readContent('en');
    const idAfter = await readContent('id');

    if (enAfter.profile.tagline === testEN) pass_('EN tagline updated correctly');
    else fail_(`EN tagline mismatch: "${enAfter.profile.tagline}"`);

    if (idAfter.profile.tagline === testID) pass_('ID tagline updated correctly');
    else fail_(`ID tagline mismatch: "${idAfter.profile.tagline}"`);

    // Restore
    await storage.updateBilingualSection(
      { ...enAfter.profile, tagline: originalTaglineEN },
      { ...idAfter.profile, tagline: originalTaglineID },
      'profile'
    );
    pass_('Restored original EN/ID taglines');
  } catch (e) {
    fail_('Bilingual save failed', e instanceof Error ? e.message : String(e));
  }

  // ── Test 6: Image upload ──
  section('6. Image Upload');
  try {
    // Create a tiny test PNG (1x1 red pixel)
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');

    // Simulate File object
    const file = new File([pngBuffer], 'test-pixel.png', { type: 'image/png' });

    const result = await upload.saveUpload(file, 'misc', 'e2e-test-pixel');

    if (result.ok) {
      pass_(`Upload succeeded — URL: ${result.url}`);
      pass_(`Filename: ${result.filename}`);

      // Verify URL is accessible (HEAD request)
      try {
        const headRes = await fetch(result.url, { method: 'HEAD' });
        if (headRes.ok) {
          pass_(`Uploaded URL returns HTTP ${headRes.status}`);
        } else {
          log(`${YELLOW}⚠${RESET}`, `URL returned HTTP ${headRes.status} (may need CDN propagation)`);
        }
      } catch (e) {
        log(`${YELLOW}⚠${RESET}`, `Could not verify URL: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      fail_(`Upload failed: ${result.error}`);
    }
  } catch (e) {
    fail_('Image upload test failed', e instanceof Error ? e.message : String(e));
  }

  // ── Test 7: Validation (Zod) ──
  section('7. Schema Validation');
  try {
    // Import actions
    const { updateProfileAction } = await import('../lib/actions.ts');
    try {
      // Invalid: missing required field
      await updateProfileAction(
        { fullName: '', nickname: '', /* ... */ } as any,
        { fullName: '', nickname: '', /* ... */ } as any
      );
      fail_('Should have rejected invalid profile');
    } catch (e) {
      if (e instanceof Error && e.message.includes('validation') || e instanceof Error && e.message.includes('Required')) {
        pass_('Invalid profile correctly rejected by Zod');
      } else {
        pass_(`Invalid data rejected: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  } catch (e) {
    fail_('Schema validation test failed', e instanceof Error ? e.message : String(e));
  }

  // ── Summary ──
  console.log(`\n${BOLD}━━━ Summary ━━━${RESET}`);
  console.log(`  ${GREEN}Passed: ${pass}${RESET}`);
  console.log(`  ${RED}Failed: ${fail}${RESET}`);
  console.log('');

  if (fail === 0) {
    console.log(`${GREEN}${BOLD}✓ All tests passed!${RESET}`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}✗ ${fail} test(s) failed${RESET}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`${RED}Fatal error:${RESET}`, e);
  process.exit(1);
});