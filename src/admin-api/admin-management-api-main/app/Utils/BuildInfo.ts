/**
 * BuildInfo — metadata leve do build do Admin API.
 * Polish Lote: expor versao/buildTime/env via /health/version sem revelar caminhos ou secrets.
 */
import fs from 'fs'
import path from 'path'

type Pkg = { name?: string; version?: string }

function loadPkg(): Pkg {
  try {
    const candidates = [
      path.resolve(__dirname, '..', '..', 'package.json'),
      path.resolve(process.cwd(), 'package.json'),
    ]
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        const raw = fs.readFileSync(c, 'utf8')
        const j = JSON.parse(raw)
        return { name: j.name, version: j.version }
      }
    }
  } catch {
    // sem package.json local — sem problema
  }
  return {}
}

const pkg = loadPkg()
const commitSha = (process.env.COMMIT_SHA || process.env.GIT_COMMIT || '').toString().slice(0, 12) || null

export const BuildInfo = {
  service: 'workeaser-admin-api',
  name: pkg.name || 'workeaser-admin-api',
  version: pkg.version || '0.0.0',
  env: (process.env.NODE_ENV || 'development').toString(),
  bootedAt: new Date().toISOString(),
  commit: commitSha,
  node: process.version,
}

export default BuildInfo
