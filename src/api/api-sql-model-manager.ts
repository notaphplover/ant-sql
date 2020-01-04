import { ApiModelManager } from '@antjs/ant-js/build/api/api-model-manager';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { Entity } from '@antjs/ant-js';
import { QueryConfigFactory } from './config/query-config-factory';
import { SqlInsertable } from '../persistence/primary/sql-insertable';

export interface ApiSqlModelManager<TEntity extends Entity>
  extends ApiModelManager<TEntity, ApiSqlModelConfig>,
    SqlInsertable<TEntity> {
  /**
   * Gets the query config factory.
   * @returns query config factory.
   */
  readonly cfgGen: QueryConfigFactory<TEntity>;
}
