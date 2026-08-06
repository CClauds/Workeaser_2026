import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { PartnerRoleEnum } from 'Contracts/enums'

export default class extends BaseSchema {
  protected tableName = 'partners'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('role', [PartnerRoleEnum.SYSTEM_DIRECTOR, PartnerRoleEnum.SYSTEM_MANAGER])
        .notNullable()
        .defaultTo(PartnerRoleEnum.SYSTEM_MANAGER)
        .after('password')
      table.index(['deleted_at'], 'idx_partners_deleted_at')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['deleted_at'], 'idx_partners_deleted_at')
      table.dropColumn('role')
    })
  }
}
