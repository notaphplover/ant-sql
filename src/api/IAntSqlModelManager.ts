import { IAntModelManager } from '@antjs/ant-js/src/api/IAntModelManager';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';

export interface IAntSqlModelManager<TEntity extends IEntity>
  extends IAntModelManager<TEntity, IAntSqlModelConfig> { }
