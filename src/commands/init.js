import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { log } from '../utils/logger.js';
import { walkDir, hashFile, exists, copyFileWithDir, ensureDir, mergeSettings, safeWriteFile } from '../utils/file-ops.js';
import { readManifest, writeManifest, createManifest } from '../utils/manifest.js';

const WORK_DIRS = [
  'outputs/reports',
  'outputs/proposals',
  'outputs/content',
  'outputs/analysis',
  'research/market',
  'research/competitors',
  'research/trends',
];

const FILE_CATEGORIES = {
  '.claude/agents/': 'core',
  '.claude/commands/': 'core',
  '.claude/research-profiles/': 'profile',
  '.claude/settings.json': 'config',
  'templates/': 'template',
  'CLAUDE.md': 'config',
};

function categorize(relPath) {
  for (const [prefix, cat] of Object.entries(FILE_CATEGORIES)) {
    if (relPath.startsWith(prefix) || relPath === prefix) return cat;
  }
  return 'core';
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (y/N) `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

export async function runInit(ctx) {
  const { targetDir, scaffoldDir, examplesDir, flags, pkg } = ctx;

  log.title(`claude-multi-agent-kit v${pkg.version} — init`);

  // Check existing manifest
  const existingManifest = await readManifest(targetDir);
  if (existingManifest && !flags.force) {
    log.warn(`既にセットアップ済みです (v${existingManifest.version})`);
    log.info('更新は cmak update を使用してください。強制再インストールは --force を指定。');
    return;
  }

  // Collect scaffold files
  const scaffoldFiles = await walkDir(scaffoldDir);
  const filesToCopy = flags['skip-profiles']
    ? scaffoldFiles.filter((f) => !f.startsWith('.claude/research-profiles/'))
    : scaffoldFiles;

  // Add example files if requested
  let exampleFiles = [];
  if (flags['with-examples']) {
    exampleFiles = (await walkDir(examplesDir)).map((f) => ({
      src: join(examplesDir, f),
      relDest: f.startsWith('research-profiles/')
        ? `.claude/${f}`
        : f,
    }));
  }

  log.info(`${filesToCopy.length} ファイルをセットアップします`);
  if (flags['dry-run']) {
    log.warn('--dry-run: プレビューのみ');
    for (const f of filesToCopy) log.dim(`copy: ${f}`);
    for (const f of exampleFiles) log.dim(`copy (example): ${f.relDest}`);
    return;
  }

  const manifestFiles = {};
  let copied = 0, skipped = 0, merged = 0;

  for (const relPath of filesToCopy) {
    const srcPath = join(scaffoldDir, relPath);
    const destPath = join(targetDir, relPath);
    const category = categorize(relPath);

    // Special handling for settings.json — merge
    if (relPath === '.claude/settings.json') {
      const scaffoldContent = JSON.parse(await readFile(srcPath, 'utf-8'));
      if (await exists(destPath)) {
        const existingContent = JSON.parse(await readFile(destPath, 'utf-8'));
        // Backup existing
        await copyFileWithDir(destPath, destPath + '.pre-multi-agent-kit');
        const mergedContent = mergeSettings(existingContent, scaffoldContent);
        await safeWriteFile(destPath, JSON.stringify(mergedContent, null, 2) + '\n');
        log.success(`${relPath} (マージ完了)`);
        merged++;
      } else {
        await safeWriteFile(destPath, JSON.stringify(scaffoldContent, null, 2) + '\n');
        log.success(`${relPath}`);
        copied++;
      }
      manifestFiles[relPath] = {
        category,
        scaffoldHash: await hashFile(srcPath),
        installedHash: await hashFile(destPath),
      };
      continue;
    }

    // Special handling for CLAUDE.md — append reference if existing
    if (relPath === 'CLAUDE.md') {
      if (await exists(destPath)) {
        if (!flags.force) {
          const existingContent = await readFile(destPath, 'utf-8');
          if (!existingContent.includes('.multi-agent-kit')) {
            // Save scaffold CLAUDE.md as separate reference
            const refPath = join(targetDir, '.claude', 'CLAUDE.multi-agent-kit.md');
            await copyFileWithDir(srcPath, refPath);
            // Append reference to existing CLAUDE.md
            const appendLine = '\n\n<!-- Multi-Agent Kit: See .claude/CLAUDE.multi-agent-kit.md for agent system rules -->\n';
            await writeFile(destPath, existingContent + appendLine, 'utf-8');
            log.success(`${relPath} (参照行追記 + .claude/CLAUDE.multi-agent-kit.md 作成)`);
            merged++;
          } else {
            log.dim(`${relPath} (既に参照あり — スキップ)`);
            skipped++;
          }
        } else {
          await copyFileWithDir(srcPath, destPath);
          log.success(`${relPath} (上書き)`);
          copied++;
        }
      } else {
        await copyFileWithDir(srcPath, destPath);
        log.success(`${relPath}`);
        copied++;
      }
      manifestFiles[relPath] = {
        category,
        scaffoldHash: await hashFile(srcPath),
        installedHash: await hashFile(destPath),
      };
      continue;
    }

    // Normal files: check for conflicts
    if (await exists(destPath)) {
      const srcHash = await hashFile(srcPath);
      const destHash = await hashFile(destPath);
      if (srcHash === destHash) {
        log.dim(`${relPath} (同一内容 — スキップ)`);
        skipped++;
      } else if (flags.force || flags.yes) {
        await copyFileWithDir(srcPath, destPath);
        log.success(`${relPath} (上書き)`);
        copied++;
      } else {
        const ok = await confirm(`  ${relPath} は既に存在し内容が異なります。上書きしますか?`);
        if (ok) {
          await copyFileWithDir(srcPath, destPath);
          log.success(`${relPath} (上書き)`);
          copied++;
        } else {
          log.dim(`${relPath} (スキップ)`);
          skipped++;
        }
      }
    } else {
      await copyFileWithDir(srcPath, destPath);
      log.success(`${relPath}`);
      copied++;
    }

    manifestFiles[relPath] = {
      category,
      scaffoldHash: await hashFile(srcPath),
      installedHash: await hashFile(destPath),
    };
  }

  // Copy example files
  for (const ef of exampleFiles) {
    const destPath = join(targetDir, ef.relDest);
    if (!(await exists(destPath)) || flags.force) {
      await copyFileWithDir(ef.src, destPath);
      log.success(`${ef.relDest} (example)`);
      copied++;
    }
  }

  // Create work directories
  for (const dir of WORK_DIRS) {
    const dirPath = join(targetDir, dir);
    if (!(await exists(dirPath))) {
      await ensureDir(dirPath);
    }
  }

  // Write manifest
  const manifest = createManifest(pkg.version, manifestFiles);
  await writeManifest(targetDir, manifest);

  // Summary
  log.blank();
  log.title('Setup complete!');
  const agents = Object.keys(manifestFiles).filter((f) => f.startsWith('.claude/agents/')).length;
  const commands = Object.keys(manifestFiles).filter((f) => f.startsWith('.claude/commands/')).length;
  const profiles = Object.keys(manifestFiles).filter((f) => f.startsWith('.claude/research-profiles/')).length;
  const templates = Object.keys(manifestFiles).filter((f) => f.startsWith('templates/')).length;

  log.list('.claude/agents/', `${agents} agent定義`, 'OK');
  log.list('.claude/commands/', `${commands} command定義`, 'OK');
  log.list('.claude/research-profiles/', `${profiles} profiles`, profiles > 0 ? 'OK' : 'skipped');
  log.list('.claude/settings.json', '1', 'OK');
  log.list('templates/', `${templates} templates`, 'OK');
  log.list('CLAUDE.md', '1', 'OK');

  log.blank();
  log.info(`コピー: ${copied}  スキップ: ${skipped}  マージ: ${merged}`);
  log.blank();
  log.info('Next steps:');
  log.dim('1. .claude/research-profiles/business-context.md を自社情報で編集');
  log.dim('2. .claude/research-profiles/brand-voice.md をブランドガイドラインで編集');
  log.dim('3. .claude/research-profiles/target-personas.md をターゲット読者で編集');
  log.dim('4. Claude Code を起動して /pattern-research-pipeline <テーマ> を実行');
}
