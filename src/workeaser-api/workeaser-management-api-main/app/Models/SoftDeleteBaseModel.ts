import Env from '@ioc:Adonis/Core/Env';
import {
  BaseModel,
  beforeFetch,
  beforeFind,
  beforePaginate,
  column,
  ModelAdapterOptions,
  ModelQueryBuilderContract
} from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

// ANSI escape codes (replaces the abandoned `colors` package, deliberately
// broken by its maintainer in 2022). Pure ANSI works in every modern terminal.
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function showDangerMessage() {
  const dev = 'development';

  if (Env.get('NODE_ENV', dev) === dev) {
    console.warn(`${RED}>> ${RESET}`);
    console.warn(`${RED}>> DANGEROUS DELETE DETECTED.${RESET}`);
    console.warn(`${RED}>> ARE YOU SURE ABOUT THAT?${RESET}`);
    console.warn(`${RED}>> May you should use (Model|QueryBuild).softDelete() instead.${RESET}`);
    console.warn(`${RED}>> ${RESET}`);
  }
}

export default class SoftDeleteBaseModel extends BaseModel {
  @column.dateTime({ serializeAs: null })
  public deletedAt?: DateTime;

  @beforeFind()
  @beforeFetch()
  public static withoutSoftDeletes(query: ModelQueryBuilderContract<typeof SoftDeleteBaseModel>) {
    const table = query.model.table;
    query.whereNull(`${table}.deleted_at`);
  }

  @beforePaginate()
  public static softDeletePaginate([countQuery, query]: [
    ModelQueryBuilderContract<typeof SoftDeleteBaseModel>,
    ModelQueryBuilderContract<typeof SoftDeleteBaseModel>
  ]) {
    const table = query.model.table;

    countQuery.whereNull(`${table}.deleted_at`);
    query.whereNull(`${table}.deleted_at`);
  }

  static query(options?: ModelAdapterOptions): any {
    const queryInstance: any = this.$adapter.query(this, options);

    queryInstance._____delete = queryInstance.delete;

    queryInstance.delete = function () {
      showDangerMessage();
      return queryInstance._____delete();
    };

    queryInstance.softDelete = function () {
      queryInstance.update('deleted_at', DateTime.local().toFormat('yyyy-MM-dd hh:mm:ss'));
      return queryInstance;
    };

    return queryInstance;
  }

  public async softDelete() {
    this.deletedAt = DateTime.local();
    await this.save();
    this.$isDeleted = true;
  }

  public async delete() {
    showDangerMessage();
    super.delete();
  }
}
