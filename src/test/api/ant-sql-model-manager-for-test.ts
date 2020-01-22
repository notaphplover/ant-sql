import { AntSqlModelManager } from '../../api/ant-sql-model-manager';
import { ApiSqlModelConfig } from '../../api/config/api-sql-model-config';
import { Entity } from '@antjs/ant-js';
import { SchedulerModelManager } from '../../persistence/scheduler/scheduler-model-manager';
import { SqlModel } from '../../model/sql-model';

export class AntSqlModelManagerForTest<TEntity extends Entity> extends AntSqlModelManager<TEntity> {
  /**
   * Model used by the model manager.
   */
  public get model(): SqlModel<TEntity> {
    return this._model;
  }

  /**
   * Gets the inner model manager.
   */
  public get scheduledManager(): SchedulerModelManager<TEntity> {
    return super.scheduledManager;
  }

  /**
   * Generates a model manager.
   * @param model Model to manage.
   * @param config AntSQL Model config.
   * @param secondaryManager secondary manager
   * @returns Model manager generated.
   */
  public generateSchedulerManager(model: SqlModel<TEntity>, config: ApiSqlModelConfig): SchedulerModelManager<TEntity> {
    return this._generateScheduledManager(model, config);
  }
}
