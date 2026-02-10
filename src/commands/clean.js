import { unlink, rmdir, readdir, copyFile as fsCopyFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { createInterface } from 'node:readline';
import { log } from '../utils/logger.js';
import { exists } from '../utils/file-ops.js';
import { readManifest, manifestPath } from '../utils/manifest.js';

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (y/N) `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function tryRmdir(dirPath) {
  try {
    const entries = await readdir(dirPath);
    if (entries.length === 0) {
      await rmdir(dirPath);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

export async function runClean(ctx) {
  const { targetDir, flags } = ctx;

  log.title('claude-multi-agent-kit — clean');

  const manifest = await readManifest(targetDir);
  if (!manifest) {
    log.error('マニフェストが見つかりません。セットアップされていないか、既にクリーン済みです。');
    return;
  }

  const allFiles = Object.keys(manifest.files);
  const filesToRemove = flags['keep-profiles']
    ? allFiles.filter((f) => !f.startsWith('.claude/research-profiles/'))
    : allFiles;

  log.info('削除対象:');
  const byCat = {};
  for (const f of filesToRemove) {
    const cat = f.split('/').slice(0, -1).join('/') || f;
    byCat[cat] = (byCat[cat] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCat)) {
    log.dim(`  ${cat}  (${count} files)`);
  }

  if (!flags['keep-profiles'] && !flags.all) {
    log.blank();
    log.info('保持されるもの:');
    log.dim('  outputs/     (成果物)');
    log.dim('  research/    (調査データ)');
  }

  if (flags.all) {
    log.warn('--all: outputs/ と research/ も削除します');
  }

  if (!flags.force && !flags.yes) {
    const ok = await confirm('\n削除を実行しますか?');
    if (!ok) {
      log.info('キャンセルしました。');
      return;
    }
  }

  if (flags['dry-run']) {
    log.warn('--dry-run: プレビューのみ');
    for (const f of filesToRemove) log.dim(`  delete: ${f}`);
    return;
  }

  // Restore settings.json backup if available
  const settingsBackupPath = join(targetDir, '.claude', 'settings.json.pre-multi-agent-kit');
  const settingsPath = join(targetDir, '.claude', 'settings.json');
  if (await exists(settingsBackupPath)) {
    await fsCopyFile(settingsBackupPath, settingsPath);
    await unlink(settingsBackupPath);
    log.success('settings.json をバックアップから復元');
  }

  let removed = 0;
  for (const relPath of filesToRemove) {
    const fullPath = join(targetDir, relPath);
    if (await exists(fullPath)) {
      try {
        await unlink(fullPath);
        removed++;
      } catch (e) {
        log.warn(`削除失敗: ${relPath} — ${e.message}`);
      }
    }
  }

  // Remove multi-agent-kit reference file
  const refPath = join(targetDir, '.claude', 'CLAUDE.multi-agent-kit.md');
  if (await exists(refPath)) {
    await unlink(refPath);
    removed++;
  }

  // Clean up empty directories
  const dirsToCheck = [
    '.claude/agents', '.claude/commands', '.claude/research-profiles',
    'templates',
  ];
  for (const dir of dirsToCheck) {
    await tryRmdir(join(targetDir, dir));
  }

  // Remove work dirs if --all
  if (flags.all) {
    const workDirs = [
      'outputs/reports', 'outputs/proposals', 'outputs/content', 'outputs/analysis',
      'research/market', 'research/competitors', 'research/trends',
      'outputs', 'research',
    ];
    for (const dir of workDirs) {
      await tryRmdir(join(targetDir, dir));
    }
  }

  // Remove manifest
  const mp = manifestPath(targetDir);
  if (await exists(mp)) {
    await unlink(mp);
  }

  // Remove backup dir
  const backupDir = join(targetDir, '.claude', '.backup');
  if (await exists(backupDir)) {
    await tryRmdir(backupDir);
  }

  log.blank();
  log.success(`${removed} ファイルを削除しました。`);
  if (!flags.all) {
    log.info('outputs/ と research/ は保持されています。--all で全削除できます。');
  }
}
