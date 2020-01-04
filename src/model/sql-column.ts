import { BaseSqlColumn } from './base-sql-column';
import { Entity } from '@antjs/ant-js';
import { SqlModel } from './sql-model';

export interface SqlColumn extends BaseSqlColumn {
  /**
   * Model referenced. This model is injected by the AntSqlManager.
   */
  refModel?: SqlModel<Entity>;
}
