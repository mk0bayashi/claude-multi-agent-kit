import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { log } from '../utils/logger.js';
import { hashFile, exists, walkDir } from '../utils/file-ops.js';
import { readManifest } from '../utils/manifest.js';

export async function runStatus(ctx) {
  const { targetDir, scaffoldDir, pkg } = ctx;

  log.title(`claude-multi-agent-kit — status`);

  const manifest = await readManifest(targetDir);
  if (!manifest) {
    log.error('セットアップされていません。cmak init を実行してください。');
    return;
  }

  // Version info
  const installedVersion = manifest.version;
  const packageVersion = pkg.version;
  const updateAvailable = installedVersion !== packageVersion;

  console.log(`  Installed version: ${installedVersion}`);
  if (updateAvailable) {
    log.warn(`  Package version:   ${packageVersion}  (update available!)`);
  } else {
    console.log(`  Package version:   ${packageVersion}`);
  }
  console.log(`  Installed at:      ${manifest.installedAt?.split('T')[0] || 'unknown'}`);
  console.log(`  Last updated:      ${manifest.updatedAt?.split('T')[0] || 'unknown'}`);

  log.blank();
  log.info('Files:');

  // Check each file category
  const categories = {
    '.claude/agents/': { label: '.claude/agents/', total: 0, ok: 0, modified: 0, missing: 0 },
    '.claude/commands/': { label: '.claude/commands/', total: 0, ok: 0, modified: 0, missing: 0 },
    '.claude/research-profiles/': { label: '.claude/research-profiles/', total: 0, ok: 0, modified: 0, missing: 0 },
    'templates/': { label: 'templates/', total: 0, ok: 0, modified: 0, missing: 0 },
  };

  for (const [relPath, info] of Object.entries(manifest.files)) {
    let cat = null;
    for (const prefix of Object.keys(categories)) {
      if (relPath.startsWith(prefix)) { cat = prefix; break; }
    }
    if (!cat) continue;

    categories[cat].total++;
    const destPath = join(targetDir, relPath);
    if (!(await exists(destPath))) {
      categories[cat].missing++;
    } else {
      const currentHash = await hashFile(destPath);
      if (currentHash === info.installedHash) {
        categories[cat].ok++;
      } else {
        categories[cat].modified++;
      }
    }
  }

  for (const c of Object.values(categories)) {
    const parts = [`${c.ok}/${c.total} OK`];
    if (c.modified > 0) parts.push(`${c.modified} modified`);
    if (c.missing > 0) parts.push(`${c.missing} missing`);
    const status = c.modified > 0 || c.missing > 0 ? parts.join(', ') : 'OK';
    log.list(c.label, `${c.total}`, status);
  }

  // Check settings.json and CLAUDE.md
  const settingsExists = await exists(join(targetDir, '.claude', 'settings.json'));
  log.list('.claude/settings.json', '1', settingsExists ? 'OK' : 'missing');

  const claudeMdExists = await exists(join(targetDir, 'CLAUDE.md'));
  log.list('CLAUDE.md', '1', claudeMdExists ? 'OK' : 'missing');

  // Profile completion check
  log.blank();
  log.info('Profile completion:');
  const profileDir = join(targetDir, '.claude', 'research-profiles');
  if (await exists(profileDir)) {
    const profileFiles = (await walkDir(profileDir)).filter((f) => f.endsWith('.md'));
    for (const pf of profileFiles) {
      const content = await readFile(join(profileDir, pf), 'utf-8');
      const placeholders = content.match(/\{[^}]+\}/g);
      if (placeholders && placeholders.length > 0) {
        log.list(`  ${pf}`, `[!] ${placeholders.length} placeholders`, 'needs customization');
      } else {
        log.list(`  ${pf}`, '', 'customized');
      }
    }
  } else {
    log.dim('  research-profiles/ が見つかりません');
  }

  if (updateAvailable) {
    log.blank();
    log.info(`cmak update を実行して v${packageVersion} に更新してください。`);
  }
}
