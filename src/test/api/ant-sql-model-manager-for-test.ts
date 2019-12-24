import { SecondaryEntityManager as AntJsSecondaryEntityManager } from '@antjs/ant-js/build/persistence/secondary/secondary-entity-manager';
import { AntSqlModelManager } from '../../api/ant-sql-model-manager';
import { ApiSqlModelConfig } from '../../api/config/api-sql-model-config';
import { Entity } from '@antjs/ant-js';
import { PrimaryModelManager } from '@antjs/ant-js/build/persistence/primary/primary-model-manager';
import { SqlModel } from '../../model/sql-model';
import { SqlPrimaryModelManager } from '../../persistence/primary/sql-primary-model-manager';

export class AntSqlModelManagerForTest<TEntity extends Entity> extends AntSqlModelManager<TEntity> {
  /**
   * Gets the inner model manager.
   */
  public get modelManager(): SqlPrimaryModelManager<TEntity> {
    return super.modelManager;
  }

  /**
   * Generates a model manager.
   * @param model Model to manage.
   * @param config AntSQL Model config.
   * @returns Model manager generated.
   */
  public generateModelManager(model: SqlModel<TEntity>, config: ApiSqlModelConfig): PrimaryModelManager<TEntity> {
    return this._generateModelManager(model, config);
  }

  /**
   * Generates a secondary model manager.
   * @param model Model to manage.
   * @param config AntSQL model config.
   * @returns Secondary model manager generated.
   */
  public generateSecondaryEntityManager(
    model: SqlModel<TEntity>,
    config: ApiSqlModelConfig,
  ): AntJsSecondaryEntityManager<TEntity> {
    return this._generateSecondaryEntityManager(model, config);
  }
}
