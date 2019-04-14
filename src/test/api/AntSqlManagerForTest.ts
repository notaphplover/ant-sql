import { IAntModelManager } from '@antjs/ant-js/src/api/IAntModelManager';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { AntSqlManager } from '../../ant';
import { IAntSqlModelConfig } from '../../api/config/IAntSqlModelConfig';
import { IAntSqlModel } from '../../model/IAntSqlModel';

export class AntSqlManagerForTest extends AntSqlManager {
  /**
   * Creates a model manager.
   * @param model Model to manage.
   * @returns model manager created.
   */
  public createModelManager<TEntity extends IEntity>(
    model: IAntSqlModel,
  ): IAntModelManager<TEntity, IAntSqlModelConfig> {
    return this._createModelManager(model);
  }
}
