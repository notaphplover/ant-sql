import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { IModelManager } from '@antjs/ant-js/src/persistence/primary/IModelManager';
import { ISecondaryEntityManager } from '@antjs/ant-js/src/persistence/secondary/ISecondaryEntityManager';
import { AntSqlModelManager } from '../../api/AntSqlModelManager';
import { IAntSqlModelConfig } from '../../api/config/IAntSqlModelConfig';
import { IAntSqlModel } from '../../model/IAntSqlModel';
import { ISqlModelManager } from '../../persistence/primary/ISqlModelManager';

export class AntSqlModelManagerForTest<TEntity extends IEntity> extends AntSqlModelManager<TEntity> {

  /**
   * Gets the inner model manager.
   */
  public get modelManager(): ISqlModelManager<TEntity> {
    return super.modelManager;
  }

  /**
   * Generates a model manager.
   * @param model Model to manage.
   * @param config AntSQL Model config.
   * @returns Model manager generated.
   */
  public generateModelManager(
    model: IAntSqlModel,
    config: IAntSqlModelConfig,
  ): IModelManager<TEntity> {
    return this._generateModelManager(model, config);
  }

  /**
   * Generates a secondary model manager.
   * @param model Model to manage.
   * @param config AntSQL model config.
   * @returns Secondary model manager generated.
   */
  public generateSecondaryEntityManager(
    model: IAntSqlModel,
    config: IAntSqlModelConfig,
  ): ISecondaryEntityManager<TEntity> {
    return this._generateSecondaryEntityManager(model, config);
  }
}
