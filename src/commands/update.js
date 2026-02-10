import { readFile, copyFile as fsCopyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { log } from '../utils/logger.js';
import { walkDir, hashFile, exists, copyFileWithDir, ensureDir, mergeSettings, safeWriteFile } from '../utils/file-ops.js';
import { readManifest, writeManifest } from '../utils/manifest.js';

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (y/N) `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

export async function runUpdate(ctx) {
  const { targetDir, scaffoldDir, flags, pkg } = ctx;

  log.title(`claude-multi-agent-kit v${pkg.version} — update`);

  const manifest = await readManifest(targetDir);
  if (!manifest) {
    log.error('セットアップされていません。まず cmak init を実行してください。');
    return;
  }

  log.info(`Installed: v${manifest.version} → Package: v${pkg.version}`);

  const scaffoldFiles = await walkDir(scaffoldDir);
  const backupDir = join(targetDir, '.claude', '.backup', new Date().toISOString().replace(/[:.]/g, '-'));

  let updated = 0, skipped = 0, added = 0;

  for (const relPath of scaffoldFiles) {
    // Skip profiles by default
    if (relPath.startsWith('.claude/research-profiles/') && !flags['include-profiles']) {
      log.dim(`${relPath} (profile — スキップ)`);
      skipped++;
      continue;
    }

    const srcPath = join(scaffoldDir, relPath);
    const destPath = join(targetDir, relPath);
    const scaffoldHash = await hashFile(srcPath);
    const manifestEntry = manifest.files[relPath];

    if (!manifestEntry) {
      // New file in package
      if (flags['dry-run']) {
        log.info(`[add] ${relPath}`);
      } else {
        await copyFileWithDir(srcPath, destPath);
        log.success(`${relPath} (新規追加)`);
      }
      added++;
      manifest.files[relPath] = {
        category: relPath.startsWith('.claude/agents/') || relPath.startsWith('.claude/commands/') ? 'core' : 'template',
        scaffoldHash,
        installedHash: scaffoldHash,
      };
      continue;
    }

    // Special handling for settings.json
    if (relPath === '.claude/settings.json') {
      if (await exists(destPath)) {
        const scaffoldContent = JSON.parse(await readFile(srcPath, 'utf-8'));
        const existingContent = JSON.parse(await readFile(destPath, 'utf-8'));
        const merged = mergeSettings(existingContent, scaffoldContent);
        const mergedStr = JSON.stringify(merged, null, 2) + '\n';
        const existingStr = JSON.stringify(existingContent, null, 2) + '\n';
        if (mergedStr !== existingStr) {
          if (!flags['dry-run']) {
            await safeWriteFile(destPath, mergedStr);
          }
          log.success(`${relPath} (再マージ)`);
          updated++;
        } else {
          log.dim(`${relPath} (変更なし)`);
          skipped++;
        }
      }
      manifest.files[relPath] = { ...manifestEntry, scaffoldHash, installedHash: await hashFile(destPath) };
      continue;
    }

    // Check if scaffold changed since last install
    if (scaffoldHash === manifestEntry.scaffoldHash) {
      log.dim(`${relPath} (パッケージ側変更なし)`);
      skipped++;
      continue;
    }

    // Scaffold changed — check if user modified
    const currentHash = await hashFile(destPath);
    if (currentHash === manifestEntry.installedHash) {
      // User didn't modify — safe to auto-update
      if (flags['dry-run']) {
        log.info(`[update] ${relPath}`);
      } else {
        await copyFileWithDir(srcPath, destPath);
        log.success(`${relPath} (自動更新)`);
      }
      updated++;
    } else {
      // User modified — ask
      if (flags.force) {
        if (!flags['dry-run']) {
          await ensureDir(backupDir);
          await fsCopyFile(destPath, join(backupDir, relPath.replace(/\//g, '_')));
          await copyFileWithDir(srcPath, destPath);
        }
        log.success(`${relPath} (バックアップ後上書き)`);
        updated++;
      } else if (flags.yes) {
        log.dim(`${relPath} (ユーザー変更済み — スキップ)`);
        skipped++;
      } else {
        log.warn(`${relPath} — ユーザー変更済み & パッケージ更新あり`);
        const ok = await confirm('  上書きしますか? (バックアップ作成済み)');
        if (ok) {
          if (!flags['dry-run']) {
            await ensureDir(backupDir);
            await fsCopyFile(destPath, join(backupDir, relPath.replace(/\//g, '_')));
            await copyFileWithDir(srcPath, destPath);
          }
          log.success(`${relPath} (バックアップ後上書き)`);
          updated++;
        } else {
          log.dim(`${relPath} (スキップ)`);
          skipped++;
        }
      }
    }

    manifest.files[relPath] = {
      ...manifestEntry,
      scaffoldHash,
      installedHash: await hashFile(destPath),
    };
  }

  if (!flags['dry-run']) {
    manifest.version = pkg.version;
    manifest.updatedAt = new Date().toISOString();
    await writeManifest(targetDir, manifest);
  }

  log.blank();
  log.info(`更新: ${updated}  新規: ${added}  スキップ: ${skipped}`);
}
