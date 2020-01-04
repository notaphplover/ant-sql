import { ApiGeneralManager, Entity } from '@antjs/ant-js';
import { ApiSqlModel } from './api-sql-model';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { ApiSqlModelManager } from './api-sql-model-manager';

export interface ApiSqlGeneralManager
  extends ApiGeneralManager<ApiSqlModelConfig, ApiSqlModel, ApiSqlModelManager<Entity>> {
  /**
   * @inheritdoc
   */
  get<TEntity extends Entity>(model: ApiSqlModel): ApiSqlModelManager<TEntity>;
}
