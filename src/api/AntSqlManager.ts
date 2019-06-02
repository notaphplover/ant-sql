import { AntManager } from '@antjs/ant-js/src/api/AntManager';
import { QueryMapType } from '@antjs/ant-js/src/api/AntModelManager';
import { IAntModelManager } from '@antjs/ant-js/src/api/IAntModelManager';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { AntSqlModelManager } from '../api/AntSqlModelManager';
import { IAntSqlModel } from '../model/IAntSqlModel';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';
import { IAntSqlModelManager } from './IAntSqlModelManager';

export class AntSqlManager extends AntManager<
  IAntSqlModelConfig,
  IAntSqlModel,
  IAntSqlModelManager<IEntity>
> {

  /**
   * Queries map.
   */
  protected _queriesMap: QueryMapType<IEntity, IAntSqlModel>;

  /**
   * Creates a new AntSqlManager.
   */
  public constructor() {
    super();
    this._queriesMap = new Map();
  }

  /**
   * Creates a model manager.
   * @param model Model to manage.
   * @returns model manager created.
   */
  protected _createModelManager<TEntity extends IEntity>(
    model: IAntSqlModel,
  ): IAntSqlModelManager<TEntity> {
    return new AntSqlModelManager<TEntity>(
      model,
      this._queriesMap as QueryMapType<TEntity, IAntSqlModel>,
    );
  }
}
