import { IAntModelConfig } from '@antjs/ant-js/src/api/config/IAntModelConfig';
import { QueryBuilder } from 'knex';

export interface IAntSqlModelConfig extends IAntModelConfig {
  /**
   * SQL Builder.
   */
  sqlBuilder: QueryBuilder;
}
