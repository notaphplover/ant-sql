import { ApiModelManager } from '@antjs/ant-js/src/api/api-model-manager';
import { Entity } from '@antjs/ant-js/src/model/entity';
import { AntSqlManager } from '../../ant';
import { IAntSqlModelConfig } from '../../api/config/IAntSqlModelConfig';
import { IAntSqlModel } from '../../model/IAntSqlModel';

export class AntSqlManagerForTest extends AntSqlManager {
  /**
   * Creates a model manager.
   * @param model Model to manage.
   * @returns model manager created.
   */
  public createModelManager<TEntity extends Entity>(
    model: IAntSqlModel,
  ): ApiModelManager<TEntity, IAntSqlModelConfig> {
    return this._createModelManager(model);
  }
}
