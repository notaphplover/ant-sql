import { AntModelManager } from '@antjs/ant-js/src/api/AntModelManager';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { IModel } from '@antjs/ant-js/src/model/IModel';
import { IModelManager } from '@antjs/ant-js/src/persistence/primary/IModelManager';
import { IPrimaryEntityManager } from '@antjs/ant-js/src/persistence/primary/IPrimaryEntityManager';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';

export class AntSqlModelManager<TEntity extends IEntity>
  extends AntModelManager<TEntity, IAntSqlModelConfig> {

  protected _generateModelManager(
    model: IModel,
    config: IAntSqlModelConfig,
  ): IModelManager<TEntity> {
    throw new Error('Method not implemented.');
  }

  protected _generatePrimaryEntityManager(
    model: IModel,
    config: IAntSqlModelConfig,
  ): IPrimaryEntityManager<TEntity> {
    throw new Error('Method not implemented.');
  }
}
