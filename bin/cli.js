#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCAFFOLD_DIR = join(__dirname, '..', 'scaffold');
const EXAMPLES_DIR = join(__dirname, '..', 'examples');
const PKG_PATH = join(__dirname, '..', 'package.json');

const { values, positionals } = parseArgs({
  allowPositionals: true,
  strict: false,
  options: {
    help:              { type: 'boolean', short: 'h' },
    version:           { type: 'boolean', short: 'v' },
    yes:               { type: 'boolean', short: 'y' },
    force:             { type: 'boolean' },
    'dry-run':         { type: 'boolean' },
    'with-examples':   { type: 'boolean' },
    'skip-profiles':   { type: 'boolean' },
    'include-profiles':{ type: 'boolean' },
    'keep-profiles':   { type: 'boolean' },
    all:               { type: 'boolean' },
  },
});

const pkg = JSON.parse(await readFile(PKG_PATH, 'utf-8'));
const [command] = positionals;

if (values.version) {
  console.log(pkg.version);
  process.exit(0);
}

if (values.help || !command) {
  showHelp();
  process.exit(0);
}

const ctx = {
  targetDir: process.cwd(),
  scaffoldDir: SCAFFOLD_DIR,
  examplesDir: EXAMPLES_DIR,
  flags: values,
  pkg,
};

switch (command) {
  case 'init': {
    const { runInit } = await import('../src/commands/init.js');
    await runInit(ctx);
    break;
  }
  case 'update': {
    const { runUpdate } = await import('../src/commands/update.js');
    await runUpdate(ctx);
    break;
  }
  case 'clean': {
    const { runClean } = await import('../src/commands/clean.js');
    await runClean(ctx);
    break;
  }
  case 'status': {
    const { runStatus } = await import('../src/commands/status.js');
    await runStatus(ctx);
    break;
  }
  default:
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}

function showHelp() {
  console.log(`
claude-multi-agent-kit v${pkg.version}
Claude Code用マルチエージェント知識ワーカーシステム

Usage: cmak <command> [options]

Commands:
  init      プロジェクトにマルチエージェントシステムをセットアップ
  update    パッケージのファイルで既存セットアップを更新
  clean     マルチエージェントシステムのファイルを削除
  status    現在のセットアップ状態を表示

Options:
  -h, --help            ヘルプを表示
  -v, --version         バージョンを表示
  -y, --yes             確認プロンプトをスキップ
  --dry-run             プレビューのみ（ファイル操作なし）
  --force               既存ファイルを強制上書き
  --with-examples       examples/ も含めてコピー (init)
  --skip-profiles       research-profiles をスキップ (init)
  --include-profiles    research-profiles も更新対象にする (update)
  --keep-profiles       research-profiles を残す (clean)
  --all                 成果物も含め全削除 (clean)
`);
}
