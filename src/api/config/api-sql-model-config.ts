import * as Knex from 'knex';
import { ApiModelConfig } from '@antjs/ant-js';

export interface ApiSqlModelConfig extends ApiModelConfig {
  /**
   * Knex instance.
   */
  readonly knex: Knex;
}
