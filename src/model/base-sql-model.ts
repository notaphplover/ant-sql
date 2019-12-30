import { BaseModel } from '@antjs/ant-js/build/model/base-model';
import { SqlColumn } from './sql-column';

export interface BaseSqlModel extends BaseModel {
  /**
   * Map of table columns, including the id;
   * The key of the map is the alias of the column in the entities managed.
   * The value of the map is the column info.
   */
  readonly columns: Iterable<SqlColumn>;
  /**
   * SQL table name.
   */
  readonly tableName: string;
}
