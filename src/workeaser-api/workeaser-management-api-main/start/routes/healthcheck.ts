/**
 * Health endpoints.
 * Polish Lote (HF-POLISH-01): adiciona /health/db e /health/version.
 * Não vaza secrets: /health/db retorna ok/notok + latência; /health/version retorna metadata leve.
 */
import HealthCheck from '@ioc:Adonis/Core/HealthCheck';
import Database from '@ioc:Adonis/Lucid/Database';
import Route from '@ioc:Adonis/Core/Route';
import BuildInfo from 'App/Utils/BuildInfo';

// GET /health — relatório completo do Adonis HealthCheck (DB + checkers customizados)
Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport();
  return report.healthy ? response.ok(report) : response.status(503).json(report);
});

// GET /health/db — ping simples ao banco. Sem timing leak, sem hostnames.
Route.get('health/db', async ({ response }) => {
  const started = Date.now();
  try {
    await Database.rawQuery('SELECT 1 as ok');
    return response.ok({ ok: true, latency_ms: Date.now() - started });
  } catch (err) {
    return response.status(503).json({ ok: false, latency_ms: Date.now() - started });
  }
});

// GET /health/version — metadata leve (sem expor caminhos, hostnames, ou secrets)
Route.get('health/version', async ({ response }) => {
  return response.ok({
    service: BuildInfo.service,
    version: BuildInfo.version,
    env: BuildInfo.env,
    bootedAt: BuildInfo.bootedAt,
    commit: BuildInfo.commit,
    node: BuildInfo.node,
  });
});
