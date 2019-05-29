import { AntModelManager } from '@antjs/ant-js/src/api/AntModelManager';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { IModelManager } from '@antjs/ant-js/src/persistence/primary/IModelManager';
import { IPrimaryEntityManager } from '@antjs/ant-js/src/persistence/primary/IPrimaryEntityManager';
import { ModelManager } from '@antjs/ant-js/src/persistence/primary/ModelManager';
import { PrimaryEntityManager } from '@antjs/ant-js/src/persistence/primary/PrimaryEntityManager';
import { ISecondaryEntityManager } from '@antjs/ant-js/src/persistence/secondary/ISecondaryEntityManager';
import { IAntSqlModel } from '../model/IAntSqlModel';
import { AntSqlSecondaryEntityManager } from '../persistence/secondary/AntSqlSecondaryEntityManager';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';

export class AntSqlModelManager<TEntity extends IEntity>
  extends AntModelManager<TEntity, IAntSqlModelConfig, IAntSqlModel> {

  /**
   * Generates a model manager.
   * @param model Model to manage.
   * @param config AntSQL Model config.
   * @returns Model manager generated.
   */
  protected _generateModelManager(
    model: IAntSqlModel,
    config: IAntSqlModelConfig,
  ): IModelManager<TEntity> {
    return new ModelManager<TEntity>(
      model,
      config.redis,
      this._generateSecondaryEntityManager(model, config),
      config.negativeCache,
    );
  }

  /**
   * Generates a secondary model manager.
   * @param model Model to manage.
   * @param config AntSQL model config.
   * @returns Secondary model manager generated.
   */
  protected _generateSecondaryEntityManager(
    model: IAntSqlModel,
    config: IAntSqlModelConfig,
  ): ISecondaryEntityManager<TEntity> {
    return new AntSqlSecondaryEntityManager(
      model,
      config.knex,
    );
  }
}
