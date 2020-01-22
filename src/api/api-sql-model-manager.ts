import { ApiModelManager } from '@antjs/ant-js/build/api/api-model-manager';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { Entity } from '@antjs/ant-js';
import { QueryConfigFactory } from './config/query-config-factory';
import { SchedulerModelManagerBase } from '../persistence/scheduler/scheduler-model-manager';
import { SqlReference } from '../model/ref/sql-reference';

export interface ApiSqlModelManager<TEntity extends Entity>
  extends ApiModelManager<TEntity, ApiSqlModelConfig>,
    SchedulerModelManagerBase<TEntity> {
  /**
   * Gets the query config factory.
   * @returns query config factory.
   */
  readonly cfgGen: QueryConfigFactory<TEntity>;

  /**
   * Creates a reference from an entity id.
   * @param id Reference's id.
   */
  getReference<TId extends number | string>(id: TId): SqlReference<TEntity, TId>;
}
