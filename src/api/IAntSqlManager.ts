import { IAntManager } from '@antjs/ant-js/src/api/IAntManager';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { IAntSqlModel } from '../model/IAntSqlModel';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';
import { IAntSqlModelManager } from './IAntSqlModelManager';

export interface IAntSqlManager extends IAntManager<
  IAntSqlModelConfig,
  IAntSqlModel,
  IAntSqlModelManager<IEntity>
> {
  /**
   * @inheritdoc
   */
  get<TEntity extends IEntity>(model: IAntSqlModel): IAntSqlModelManager<TEntity>;
}
