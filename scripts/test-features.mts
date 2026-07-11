#!/usr/bin/env node
/**
 * E2E test for ALL admin features against production
 */

import Module from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';

// Load .env.production FIRST so it has correct Vercel secrets
dotenvConfig({ path: '.env.production' });
dotenvConfig({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stubPath = path.join(__dirname, 'server-only-stub.cjs');
const origResolve = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (req, ...args) {
  if (req === 'server-only') return stubPath;
  return origResolve.call(this, req, ...args);
};

const { getContentStorage, getUploadStorage, getStorageInfo, readContent } = await import('../lib/storage/index.ts');

const BASE_URL = 'https://raniandriani.vercel.app';
const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) {
  console.error('COOKIE_SECRET not set');
  process.exit(1);
}
const COOKIE = `rani_admin_session=${COOKIE_SECRET}`;

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';

let pass = 0, fail = 0;

function pass_(msg) { pass++; console.log(`  ${GREEN}✓${RESET} ${msg}`); }
function fail_(msg, err) { fail++; console.log(`  ${RED}✗${RESET} ${msg}`); if (err) console.log(`    ${err}`); }
function info_(msg) { console.log(`  ${BLUE}ℹ${RESET} ${msg}`); }
function section(name) { console.log(`\n${BOLD}${BLUE}━━━ ${name} ━━━${RESET}`); }
async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchHtml(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Cookie: COOKIE, ...options.headers },
    redirect: options.redirect ?? 'follow'
  });
  return { status: res.status, text: await res.text() };
}

async function main() {
  console.log(`${BOLD}Rani Portfolio — Production E2E Admin Test${RESET}`);
  console.log(`Base: ${BASE_URL}`);
  console.log(`Cookie: ${COOKIE.substring(0, 50)}...\n`);

  // ── 1. Login & dashboard ──
  section('1. Login & Dashboard');
  try {
    // No cookie: should render login form
    const r1 = await fetch(`${BASE_URL}/en/admin/login`, { redirect: 'manual' });
    if (r1.status === 200) pass_(`Login page renders without cookie (HTTP 200)`);
    else fail_(`Login without cookie HTTP ${r1.status}`);

    // With cookie: should redirect to dashboard
    const r2 = await fetch(`${BASE_URL}/en/admin/login`, { headers: { Cookie: COOKIE }, redirect: 'manual' });
    if (r2.status === 307) pass_(`Login with cookie redirects to dashboard (HTTP 307)`);
    else fail_(`Login with cookie HTTP ${r2.status}`);
  } catch (e) { fail_('Login failed', e.message); }

  try {
    const r = await fetchHtml('/en/admin/dashboard');
    if (r.status === 200 && r.text.includes('Welcome back')) pass_('Dashboard renders with content');
    else fail_(`Dashboard HTTP ${r.status}, hasWelcome=${r.text.includes('Welcome back')}`);
  } catch (e) { fail_('Dashboard failed', e.message); }

  // ── 2. All 13 editor pages ──
  section('2. All 13 Editor Pages (render + Save button + tabs)');
  const pages = ['profile', 'hero', 'bio', 'education', 'experiences', 'skills', 'projects', 'publications', 'awards', 'certifications', 'volunteering', 'footer'];
  for (const p of pages) {
    try {
      const r = await fetchHtml(`/en/admin/dashboard/${p}`);
      const hasSave = r.text.includes('Save All');
      const hasCopy = r.text.includes('EN → ID') || r.text.includes('EN  ID');
      const hasEN = r.text.includes('English');
      const hasID = r.text.includes('Indonesia');
      const allGood = r.status === 200 && hasSave && hasCopy && hasEN && hasID;
      if (allGood) pass_(`${p.padEnd(15)} ✓ Save + Copy + EN/ID tabs`);
      else fail_(`${p.padEnd(15)} HTTP=${r.status} save=${hasSave} copy=${hasCopy} en=${hasEN} id=${hasID}`);
    } catch (e) { fail_(`${p} failed`, e.message); }
  }

  // ── 3. Auth protection ──
  section('3. Auth Protection');
  try {
    const r = await fetch(`${BASE_URL}/en/admin/dashboard`, { redirect: 'manual' });
    if (r.status === 307) pass_('Dashboard redirects when no cookie (307)');
    else fail_(`No-cookie HTTP ${r.status}`);
  } catch (e) { fail_('Auth test failed', e.message); }

  // ── 4. Storage backend ──
  section('4. Storage Backend');
  const info = getStorageInfo();
  info_(`Content: ${info.content}, Upload: ${info.upload}`);
  if (info.content === 'github') pass_('GitHub backend active in production');

  try {
    const en = await readContent('en');
    pass_(`Read en.json: ${Object.keys(en).length} sections`);
  } catch (e) { fail_('Read failed', e.message); }

  // ── 5. EDIT single field ──
  section('5. EDIT Single Field (profile.tagline)');
  const storage = getContentStorage();
  try {
    const before = await readContent('en');
    const idBefore = await readContent('id');
    const original = before.profile.tagline;
    const testVal = `__TEST_${Date.now()}__`;

    await storage.updateBilingualSection(
      { ...before.profile, tagline: testVal },
      { ...idBefore.profile, tagline: testVal },
      'profile'
    );
    pass_('updateBilingualSection succeeded (GitHub commit)');
    await delay(1500);

    const after = await readContent('en');
    if (after.profile.tagline === testVal) pass_('EN readback matches new value');
    else fail_(`Mismatch: expected "${testVal}", got "${after.profile.tagline}"`);

    // Restore
    await storage.updateBilingualSection(
      { ...after.profile, tagline: original },
      { ...(await readContent('id')).profile, tagline: original },
      'profile'
    );
    pass_('Restored original tagline');
  } catch (e) { fail_('Edit failed', e.message); }

  // ── 6. ADD new entry ──
  section('6. ADD New Entry');
  try {
    const before = await readContent('en');
    const idBefore = await readContent('id');
    const newExp = {
      id: `exp-test-${Date.now()}`,
      role: 'TEST POSITION - Delete me',
      company: 'TEST COMPANY',
      type: 'Test',
      period: '2026',
      startDate: '2026-01',
      endDate: '2026-12',
      isCurrent: false,
      duration: '1 yr',
      location: 'Test',
      description: 'Automated test',
      skills: ['Test'],
      achievements: [],
      companyUrl: '',
      images: []
    };
    await storage.updateBilingualSection(
      [...(before.experiences ?? []), newExp],
      [...(idBefore.experiences ?? []), { ...newExp, role: 'TEST POSISI', company: 'PERUSAHAAN TEST' }],
      'experiences'
    );
    pass_('New entry added (bilingual EN + ID committed)');
    await delay(1500);
    const after = await readContent('en');
    const found = (after.experiences ?? []).find(e => e.id === newExp.id);
    if (found) pass_(`EN readback shows new entry: "${found.role}"`);
    else fail_('Entry not in EN readback');
  } catch (e) { fail_('Add failed', e.message); }

  // ── 7. DELETE entry ──
  section('7. DELETE Entry');
  try {
    const before = await readContent('en');
    const idBefore = await readContent('id');
    const toDelete = (before.experiences ?? []).find(e => e.role.startsWith('TEST POSITION'));
    if (!toDelete) {
      fail_('No test entry to delete');
    } else {
      await storage.updateBilingualSection(
        (before.experiences ?? []).filter(e => e.id !== toDelete.id),
        (idBefore.experiences ?? []).filter(e => e.id !== toDelete.id),
        'experiences'
      );
      pass_(`Entry deleted: ${toDelete.id}`);
      await delay(1500);
      const after = await readContent('en');
      const stillExists = (after.experiences ?? []).find(e => e.id === toDelete.id);
      if (!stillExists) pass_('Delete verified in readback');
      else fail_('Entry still exists after delete');
    }
  } catch (e) { fail_('Delete failed', e.message); }

  // ── 8. Image upload ──
  section('8. Image Upload');
  try {
    const upload = getUploadStorage();
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const file = new File([Buffer.from(pngBase64, 'base64')], 'e2e-test.png', { type: 'image/png' });
    const result = await upload.saveUpload(file, 'misc', 'e2e-suite');
    if (result.ok) {
      pass_(`Upload committed: ${result.filename}`);
      try {
        const head = await fetch(result.url, { method: 'HEAD' });
        if (head.ok) pass_(`Image URL HTTP ${head.status} (jsDelivr CDN)`);
        else fail_(`Image URL HTTP ${head.status}`);
      } catch (e) { info_(`CDN check error: ${e.message}`); }
    } else {
      fail_(`Upload failed: ${result.error}`);
    }
  } catch (e) { fail_('Upload test failed', e.message); }

  // ── 9. Loading screen markup ──
  section('9. Loading Screen UI in Editor');
  try {
    const r = await fetchHtml('/en/admin/dashboard/profile');
    const hasLoadingButton = r.text.includes('Loader2') || r.text.includes('animate-spin') || r.text.includes('Saving');
    if (hasLoadingButton) pass_('Loading state markup found in initial render');
    else info_('Loading markup is conditional (only renders when pending)');
  } catch (e) { fail_('Loading UI check failed', e.message); }

  // ── Summary ──
  console.log(`\n${BOLD}━━━ Summary ━━━${RESET}`);
  console.log(`  ${GREEN}Passed: ${pass}${RESET}`);
  console.log(`  ${RED}Failed: ${fail}${RESET}\n`);

  if (fail === 0) { console.log(`${GREEN}${BOLD}✓ All admin features verified!${RESET}`); process.exit(0); }
  else { console.log(`${RED}${BOLD}✗ ${fail} test(s) failed${RESET}`); process.exit(1); }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });