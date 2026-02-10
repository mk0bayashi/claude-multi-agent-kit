import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, stat, copyFile, access, constants } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export async function hashFile(filePath) {
  try {
    const content = await readFile(filePath);
    return sha256(content);
  } catch {
    return null;
  }
}

export async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

export async function copyFileWithDir(src, dest) {
  await ensureDir(dirname(dest));
  await copyFile(src, dest);
}

export async function safeWriteFile(filePath, content) {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Recursively collect all file paths under a directory (relative to baseDir).
 */
export async function walkDir(dir, baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkDir(fullPath, baseDir));
    } else {
      files.push(relative(baseDir, fullPath));
    }
  }
  return files.sort();
}

/**
 * Merge settings.json: union permissions.allow, add new env keys only.
 */
export function mergeSettings(existing, scaffold) {
  const result = JSON.parse(JSON.stringify(existing));

  if (scaffold.permissions?.allow) {
    result.permissions = result.permissions || {};
    result.permissions.allow = [
      ...new Set([
        ...(result.permissions.allow || []),
        ...scaffold.permissions.allow,
      ]),
    ];
  }

  if (scaffold.env) {
    result.env = result.env || {};
    for (const [key, value] of Object.entries(scaffold.env)) {
      if (!(key in result.env)) {
        result.env[key] = value;
      }
    }
  }

  return result;
}
