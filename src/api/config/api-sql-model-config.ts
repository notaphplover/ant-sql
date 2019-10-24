import { ApiModelConfig } from '@antjs/ant-js';
import * as Knex from 'knex';

export interface ApiSqlModelConfig extends ApiModelConfig {
  /**
   * Knex instance.
   */
  knex: Knex;
}
