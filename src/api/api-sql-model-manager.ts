import { Entity } from '@antjs/ant-js';
import { ApiModelManager } from '@antjs/ant-js/src/api/api-model-manager';
import { ISqlInsertable } from '../persistence/primary/ISqlInsertable';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { QueryConfigFactory } from './config/query-config-factory';

export interface ApiSqlModelManager<TEntity extends Entity>
  extends ApiModelManager<TEntity, ApiSqlModelConfig>,
    ISqlInsertable<TEntity> {
  /**
   * Gets the query config factory.
   * @returns query config factory.
   */
  cfgGen: QueryConfigFactory<TEntity>;
}
