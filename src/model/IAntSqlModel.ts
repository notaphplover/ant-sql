import { IModel } from '@antjs/ant-js/src/model/IModel';

export interface IAntSqlModel extends IModel {
  /**
   * SQL table name.
   */
  tableName: string;
}
