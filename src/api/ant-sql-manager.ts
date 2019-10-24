import { Entity } from '@antjs/ant-js';
import { AntManager } from '@antjs/ant-js/src/api/ant-manager';
import { AntSqlModelManager } from '../api/ant-sql-model-manager';
import { SqlModel } from '../model/sql-model';
import { ApiSqlGeneralManager } from './api-sql-general-manager';
import { ApiSqlModelManager } from './api-sql-model-manager';
import { ApiSqlModelConfig } from './config/api-sql-model-config';

export class AntSqlManager extends AntManager<ApiSqlModelConfig, SqlModel, ApiSqlModelManager<Entity>>
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
  public get<TEntity extends Entity>(model: SqlModel): ApiSqlModelManager<TEntity> {
    return super.get(model) as ApiSqlModelManager<TEntity>;
  }

  /**
   * Creates a model manager.
   * @param model Model to manage.
   * @returns model manager created.
   */
  protected _createModelManager<TEntity extends Entity>(model: SqlModel): ApiSqlModelManager<TEntity> {
    return new AntSqlModelManager<TEntity>(model);
  }
}
