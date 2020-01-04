import { BaseModel } from '@antjs/ant-js/build/model/base-model';
import { BaseSqlColumn } from './base-sql-column';

export interface BaseSqlModel<TColumn extends BaseSqlColumn> extends BaseModel {
  /**
   * Alias of this model. If provided, this is the alias used to create a reference to this model.
   */
  readonly alias?: string;
  /**
   * Map of table columns, including the id;
   * The key of the map is the alias of the column in the entities managed.
   * The value of the map is the column info.
   */
  readonly columns: Iterable<TColumn>;
  /**
   * SQL table name.
   */
  readonly tableName: string;
}
