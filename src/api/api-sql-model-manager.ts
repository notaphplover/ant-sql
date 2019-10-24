import { Entity } from '@antjs/ant-js';
import { ApiModelManager } from '@antjs/ant-js/src/api/api-model-manager';
import { SqlInsertable } from '../persistence/primary/sql-insertable';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { QueryConfigFactory } from './config/query-config-factory';

export interface ApiSqlModelManager<TEntity extends Entity>
  extends ApiModelManager<TEntity, ApiSqlModelConfig>,
    SqlInsertable<TEntity> {
  /**
   * Gets the query config factory.
   * @returns query config factory.
   */
  cfgGen: QueryConfigFactory<TEntity>;
}
