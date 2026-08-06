import Database from '@ioc:Adonis/Lucid/Database'
import Logger from '@ioc:Adonis/Core/Logger'

interface DashboardMetrics {
  active_coworkings: number
  total_users: number
  active_users: number
  total_clients: number
  active_locations: number
  partners_count: number
  signups_last_30d: number
  cowork_growth_per_month: { month: string; count: number }[]
}

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    Logger.warn({ err, label }, 'Admin dashboard metric failed; using fallback')
    return fallback
  }
}

export default class DashboardService {
  static async metrics(): Promise<DashboardMetrics> {
    const [
      activeCoworkings,
      totalUsers,
      activeUsers,
      totalClients,
      activeLocations,
      partnersCount,
      signups30d,
      growth,
    ] = await Promise.all([
      safe(
        'active_coworkings',
        () => this.countActiveTable('cowork_accounts'),
        0
      ),
      safe('total_users', () => this.countTable('users'), 0),
      safe('active_users', () => this.countActiveTable('users'), 0),
      safe(
        'total_clients',
        () => this.countActiveTable('client_accounts'),
        0
      ),
      safe(
        'active_locations',
        () => this.countActiveTable('locations'),
        0
      ),
      safe(
        'partners_count',
        () => this.countActiveTable('partners'),
        0
      ),
      safe('signups_last_30d', () => this.recentSignups(), 0),
      safe('cowork_growth_per_month', () => this.coworkGrowth(), []),
    ])

    return {
      active_coworkings: activeCoworkings,
      total_users: totalUsers,
      active_users: activeUsers,
      total_clients: totalClients,
      active_locations: activeLocations,
      partners_count: partnersCount,
      signups_last_30d: signups30d,
      cowork_growth_per_month: growth,
    }
  }

  private static async countActiveTable(table: string): Promise<number> {
    const rows = await Database.from(table).whereNull('deleted_at').count('* as total')
    return Number((rows[0] as any).total) || 0
  }

  private static async countTable(table: string): Promise<number> {
    const rows = await Database.from(table).count('* as total')
    return Number((rows[0] as any).total) || 0
  }

  private static async recentSignups(): Promise<number> {
    const rows = await Database.from('users')
      .whereRaw('created_at >= NOW() - INTERVAL 30 DAY')
      .whereNull('deleted_at')
      .count('* as total')
    return Number((rows[0] as any).total) || 0
  }

  private static async coworkGrowth(): Promise<{ month: string; count: number }[]> {
    const rows = await Database.from('cowork_accounts')
      .select(Database.raw("DATE_FORMAT(created_at, '%Y-%m') as month"))
      .count('* as count')
      .whereRaw('created_at >= NOW() - INTERVAL 12 MONTH')
      .groupBy('month')
      .orderBy('month', 'asc')

    return rows.map((r: any) => ({ month: r.month, count: Number(r.count) }))
  }
}
