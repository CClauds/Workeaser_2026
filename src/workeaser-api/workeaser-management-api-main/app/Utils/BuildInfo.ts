/**
 * BuildInfo — metadata leve do build. Lido em tempo de import.
 *
 * Adicionado pelo Polish Lote: expor versao/buildTime/env via /health/version
 * sem revelar caminhos, hostnames, ou secrets.
 */
import fs from 'fs';
import path from 'path';

type Pkg = { name?: string; version?: string };

function loadPkg(): Pkg {
  try {
    const candidates = [
      path.resolve(__dirname, '..', '..', 'package.json'),
      path.resolve(process.cwd(), 'package.json'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        const raw = fs.readFileSync(c, 'utf8');
        const j = JSON.parse(raw);
        return { name: j.name, version: j.version };
      }
    }
  } catch {
    // sem package.json local — tudo bem, devolvemos defaults
  }
  return {};
}

const pkg = loadPkg();

// COMMIT_SHA pode ser injetado durante build (ex.: --define ou .env)
const commitSha = (process.env.COMMIT_SHA || process.env.GIT_COMMIT || '').toString().slice(0, 12) || null;

export const BuildInfo = {
  service: 'workeaser-management-api',
  name: pkg.name || 'workeaser-product',
  version: pkg.version || '0.0.0',
  env: (process.env.NODE_ENV || 'development').toString(),
  bootedAt: new Date().toISOString(),
  commit: commitSha,
  node: process.version,
};

export default BuildInfo;
