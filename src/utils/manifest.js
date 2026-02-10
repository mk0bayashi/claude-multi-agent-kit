import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { exists, ensureDir } from './file-ops.js';

const MANIFEST_NAME = '.multi-agent-kit.json';

export function manifestPath(targetDir) {
  return join(targetDir, '.claude', MANIFEST_NAME);
}

export async function readManifest(targetDir) {
  const p = manifestPath(targetDir);
  if (!(await exists(p))) return null;
  const raw = await readFile(p, 'utf-8');
  return JSON.parse(raw);
}

export async function writeManifest(targetDir, data) {
  const p = manifestPath(targetDir);
  await ensureDir(join(targetDir, '.claude'));
  await writeFile(p, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function createManifest(version, files) {
  return {
    version,
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    files,
  };
}
