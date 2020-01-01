import { Entity, Model } from '@antjs/ant-js';
import { BaseSqlModel } from './base-sql-model';
import { SqlColumn } from './sql-column';

export interface SqlModel<TEntity extends Entity> extends BaseSqlModel<SqlColumn>, Model<TEntity> {
  /**
   * Gets a column by its alias
   */
  columnByAlias(alias: string): SqlColumn;
  /**
   * Gets a column by an SQL alias.
   * @param alias Alias of the column at the SQL server.
   * @returns Column.
   */
  columnBySql(alias: string): SqlColumn;
  /**
   * Gets the auto generated column of the model.
   * @returns Auto generated column of the model or null if no column is auto generated.
   */
  getAutoGeneratedColumn(): SqlColumn;
}
