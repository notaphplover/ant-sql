import { Entity } from '@antjs/ant-js';
import { ApiModelManager } from '@antjs/ant-js/src/api/api-model-manager';
import { AntSqlManager } from '../../api/ant-sql-manager';
import { ApiSqlModelConfig } from '../../api/config/api-sql-model-config';
import { SqlModel } from '../../model/sql-model';

export class AntSqlManagerForTest extends AntSqlManager {
  /**
   * Creates a model manager.
   * @param model Model to manage.
   * @returns model manager created.
   */
  public createModelManager<TEntity extends Entity>(model: SqlModel): ApiModelManager<TEntity, ApiSqlModelConfig> {
    return this._createModelManager(model);
  }
}
