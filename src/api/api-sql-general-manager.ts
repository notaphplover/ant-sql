import { ApiGeneralManager, Entity } from '@antjs/ant-js';
import { IAntSqlModel } from '../model/IAntSqlModel';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { ApiSqlModelManager } from './api-sql-model-manager';

export interface ApiSqlGeneralManager
  extends ApiGeneralManager<ApiSqlModelConfig, IAntSqlModel, ApiSqlModelManager<Entity>> {
  /**
   * @inheritdoc
   */
  get<TEntity extends Entity>(model: IAntSqlModel): ApiSqlModelManager<TEntity>;
}
