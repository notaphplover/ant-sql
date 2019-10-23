import { AntManager } from '@antjs/ant-js/src/api/ant-manager';
import { Entity } from '@antjs/ant-js/src/model/entity';
import { AntSqlModelManager } from '../api/AntSqlModelManager';
import { IAntSqlModel } from '../model/IAntSqlModel';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';
import { IAntSqlManager } from './IAntSqlManager';
import { IAntSqlModelManager } from './IAntSqlModelManager';

export class AntSqlManager extends AntManager<
  IAntSqlModelConfig,
  IAntSqlModel,
  IAntSqlModelManager<Entity>
> implements IAntSqlManager {

  /**
   * Creates a new AntSqlManager.
   */
  public constructor() {
    super();
  }

  /**
   * @inheritdoc
   */
  public get<TEntity extends Entity>(model: IAntSqlModel): IAntSqlModelManager<TEntity> {
    return super.get(model) as IAntSqlModelManager<TEntity>;
  }

  /**
   * Creates a model manager.
   * @param model Model to manage.
   * @returns model manager created.
   */
  protected _createModelManager<TEntity extends Entity>(model: IAntSqlModel): IAntSqlModelManager<TEntity> {
    return new AntSqlModelManager<TEntity>(model);
  }
}
