/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Workeaser Admin API — internal management surface (partners, clients,
| dashboard). Public surface limited to `/api/auth/login`; everything else
| requires an authenticated partner.
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import BuildInfo from 'App/Utils/BuildInfo'
import './routes/auth'
import './routes/partners'
import './routes/clients'
import './routes/dashboard'

Route.get('/', async () => {
  return { service: 'workeaser-admin-api', status: 'ok' }
})

// Health endpoints (Polish Lote HF-POLISH-01)
Route.get('/healthz', async () => {
  // Kept for backwards compat with simple uptime probes
  return { ok: true, ts: new Date().toISOString() }
})

Route.get('/health', async ({ response }) => {
  return response.ok({ ok: true, service: BuildInfo.service, env: BuildInfo.env, ts: new Date().toISOString() })
})

Route.get('/health/db', async ({ response }) => {
  const started = Date.now()
  try {
    await Database.rawQuery('SELECT 1 as ok')
    return response.ok({ ok: true, latency_ms: Date.now() - started })
  } catch (err) {
    return response.status(503).json({ ok: false, latency_ms: Date.now() - started })
  }
})

Route.get('/health/version', async ({ response }) => {
  return response.ok({
    service: BuildInfo.service,
    version: BuildInfo.version,
    env: BuildInfo.env,
    bootedAt: BuildInfo.bootedAt,
    commit: BuildInfo.commit,
    node: BuildInfo.node,
  })
})
