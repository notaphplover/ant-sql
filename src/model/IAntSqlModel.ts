import { IModel } from '@antjs/ant-js/src/model/IModel';
import { IAntSQLColumn } from './IAntSQLColumn';

export interface IAntSqlModel extends IModel {
  /**
   * Map of table columns, including the id;
   * The key of the map is the alias of the column in the entities managed.
   * The value of the map is the column info.
   */
  columns: Map<string, IAntSQLColumn>;
  /**
   * SQL table name.
   */
  tableName: string;
}
