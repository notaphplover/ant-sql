import { ApiGeneralManager, Entity } from '@antjs/ant-js';
import { SqlModel } from '../model/sql-model';
import { ApiSqlModelManager } from './api-sql-model-manager';
import { ApiSqlModelConfig } from './config/api-sql-model-config';

export interface ApiSqlGeneralManager
  extends ApiGeneralManager<ApiSqlModelConfig, SqlModel, ApiSqlModelManager<Entity>> {
  /**
   * @inheritdoc
   */
  get<TEntity extends Entity>(model: SqlModel): ApiSqlModelManager<TEntity>;
}
