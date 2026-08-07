import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class SeedMissingCoworkModules extends BaseSchema {
  protected tableName = 'cowork_modules';

  public async up() {
    // Inserta los slugs VIRTUAL_OFFICE y MEETROOM que faltan en cowork_modules.
    // El enum CoworkModulesEnum ya los define, pero las filas no existen en la DB
    // (solo hay 6: LOCATIONS, SERVICES, RELATIONSHIP, FINANCES, REPORTS, ACCOUNT_SETTINGS).
    // Sin estas filas, el middleware coworkAuthorization devuelve 403 para cualquier
    // usuario no-MANAGER que intente acceder a esas rutas.
    this.defer(async (db) => {
      const existing = await db
        .from(this.tableName)
        .whereIn('slug', ['VIRTUAL_OFFICE', 'MEETROOM'])
        .select('slug');

      const existingSlugs = existing.map((r: any) => r.slug);

      if (!existingSlugs.includes('VIRTUAL_OFFICE')) {
        await db.table(this.tableName).insert({
          name: 'Virtual Office',
          slug: 'VIRTUAL_OFFICE',
          created_at: db.raw('NOW()'),
          updated_at: db.raw('NOW()'),
        });
      }

      if (!existingSlugs.includes('MEETROOM')) {
        await db.table(this.tableName).insert({
          name: 'Meeting Room',
          slug: 'MEETROOM',
          created_at: db.raw('NOW()'),
          updated_at: db.raw('NOW()'),
        });
      }
    });
  }

  public async down() {
    // Revierte el seed: elimina las filas insertadas. No elimina si ya existían antes.
    this.defer(async (db) => {
      await db
        .from(this.tableName)
        .whereIn('slug', ['VIRTUAL_OFFICE', 'MEETROOM'])
        .delete();
    });
  }
}
