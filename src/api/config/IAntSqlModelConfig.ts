import { ApiModelConfig } from '@antjs/ant-js/src/api/config/api-model-config';
import * as Knex from 'knex';

export interface IAntSqlModelConfig extends ApiModelConfig {
  /**
   * Knex instance.
   */
  knex: Knex;
}
