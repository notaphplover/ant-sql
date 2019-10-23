import { Model } from '@antjs/ant-js/src/model/model';
import { IAntSQLColumn } from './IAntSQLColumn';

export interface IAntSqlModel extends Model {
  /**
   * Map of table columns, including the id;
   * The key of the map is the alias of the column in the entities managed.
   * The value of the map is the column info.
   */
  columns: Iterable<IAntSQLColumn>;
  /**
   * SQL table name.
   */
  tableName: string;
  /**
   * Gets the auto generated column of the model.
   * @returns Auto generated column of the model or null if no column is auto generated.
   */
  getAutoGeneratedColumn(): IAntSQLColumn;

  /**
   * Gets a column by its alias
   */
  getColumn(alias: string): IAntSQLColumn;
}
