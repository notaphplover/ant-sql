import { ApiGeneralManager } from '@antjs/ant-js/src/api/api-general-manager';
import { Entity } from '@antjs/ant-js/src/model/entity';
import { IAntSqlModel } from '../model/IAntSqlModel';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';
import { IAntSqlModelManager } from './IAntSqlModelManager';

export interface IAntSqlManager extends ApiGeneralManager<
  IAntSqlModelConfig,
  IAntSqlModel,
  IAntSqlModelManager<Entity>
> {
  /**
   * @inheritdoc
   */
  get<TEntity extends Entity>(model: IAntSqlModel): IAntSqlModelManager<TEntity>;
}
