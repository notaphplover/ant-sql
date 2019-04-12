import { IAntModelConfig } from '@antjs/ant-js/src/api/config/IAntModelConfig';
import * as Knex from 'knex';

export interface IAntSqlModelConfig extends IAntModelConfig {
  /**
   * Knex instance.
   */
  knex: Knex;
}
