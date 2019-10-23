import { ApiModelConfig } from '@antjs/ant-js';
import * as Knex from 'knex';

export interface IAntSqlModelConfig extends ApiModelConfig {
  /**
   * Knex instance.
   */
  knex: Knex;
}
