import { Entity } from '@antjs/ant-js';
import { AntManager } from '@antjs/ant-js/src/api/ant-manager';
import { AntSqlModelManager } from '../api/ant-sql-model-manager';
import { IAntSqlModel } from '../model/IAntSqlModel';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { ApiSqlGeneralManager } from './api-sql-general-manager';
import { ApiSqlModelManager } from './api-sql-model-manager';

export class AntSqlManager extends AntManager<ApiSqlModelConfig, IAntSqlModel, ApiSqlModelManager<Entity>>
  implements ApiSqlGeneralManager {
  /**
   * Creates a new AntSqlManager.
   */
  public constructor() {
    super();
  }

  /**
   * @inheritdoc
   */
  public get<TEntity extends Entity>(model: IAntSqlModel): ApiSqlModelManager<TEntity> {
    return super.get(model) as ApiSqlModelManager<TEntity>;
  }

  /**
   * Creates a model manager.
   * @param model Model to manage.
   * @returns model manager created.
   */
  protected _createModelManager<TEntity extends Entity>(model: IAntSqlModel): ApiSqlModelManager<TEntity> {
    return new AntSqlModelManager<TEntity>(model);
  }
}
