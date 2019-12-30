import { AntManager } from '@antjs/ant-js/build/api/ant-manager';
import { AntSqlModel } from '../model/ant-sql-model';
import { AntSqlModelManager } from '../api/ant-sql-model-manager';
import { ApiSqlGeneralManager } from './api-sql-general-manager';
import { ApiSqlModel } from './api-sql-model';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { ApiSqlModelManager } from './api-sql-model-manager';
import { Entity } from '@antjs/ant-js';

export class AntSqlManager extends AntManager<ApiSqlModelConfig, ApiSqlModel, ApiSqlModelManager<Entity>>
  implements ApiSqlGeneralManager {
  /**
   * @inheritdoc
   */
  public get<TEntity extends Entity>(model: ApiSqlModel): ApiSqlModelManager<TEntity> {
    return super.get(model) as ApiSqlModelManager<TEntity>;
  }

  /**
   * Creates a model manager.
   * @param model Model to manage.
   * @returns model manager created.
   */
  protected _createModelManager<TEntity extends Entity>(model: ApiSqlModel): ApiSqlModelManager<TEntity> {
    return new AntSqlModelManager<TEntity>(new AntSqlModel(model.id, model.keyGen, model.columns, model.tableName));
  }
}
