import { ApiGeneralManager, Entity } from '@antjs/ant-js';
import { ApiSqlModel } from './api-sql-model';
import { ApiSqlModelManager } from './api-sql-model-manager';
import { ApiSqlModelConfig } from './config/api-sql-model-config';

export interface ApiSqlGeneralManager
  extends ApiGeneralManager<ApiSqlModelConfig, ApiSqlModel, ApiSqlModelManager<Entity>> {
  /**
   * @inheritdoc
   */
  get<TEntity extends Entity>(model: ApiSqlModel): ApiSqlModelManager<TEntity>;
}
