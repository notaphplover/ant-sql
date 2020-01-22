import { Entity, PersistencyUpdateOptions } from '@antjs/ant-js';
import { AntJsUpdateOptions } from '@antjs/ant-js/build/persistence/primary/options/antjs-update-options';
import { AntScheduleModelManager } from '@antjs/ant-js/build/persistence/scheduler/ant-scheduler-model-manager';
import { PrimaryModelManager } from '@antjs/ant-js/build/persistence/primary/primary-model-manager';
import { SchedulerModelManager } from './scheduler-model-manager';
import { SecondaryEntityManager } from '../secondary/secondary-entity-manager';
import { SqlModel } from '../../model/sql-model';

export class SqlSchedulerModelManager<TEntity extends Entity, TModel extends SqlModel<TEntity>>
  extends AntScheduleModelManager<TEntity, TModel, PrimaryModelManager<TEntity>, SecondaryEntityManager<TEntity>>
  implements SchedulerModelManager<TEntity> {
  /**
   * Inserts an entity
   * @param entity Entity to be inserted.
   * @param options Persistency options.
   * @returns Promise of entity inserted.
   */
  public async insert(entity: TEntity, options?: Partial<PersistencyUpdateOptions>): Promise<any> {
    const updateOptions = new AntJsUpdateOptions(options);
    if (null != this._secondaryManager && !updateOptions.ignoreSecondaryLayer) {
      await this._secondaryManager.insert(entity);
    }
    return this._primaryUpsert(entity, updateOptions);
  }
  /**
   * Inserts multiple entities
   * @param entities Entities to be inserted
   * @param options Persistency options.
   * @returns Promise of entities inserted.
   */
  public async mInsert(entities: TEntity[], options?: Partial<PersistencyUpdateOptions>): Promise<any> {
    const updateOptions = new AntJsUpdateOptions(options);
    if (null != this._secondaryManager && !updateOptions.ignoreSecondaryLayer) {
      await this._secondaryManager.mInsert(entities);
    }
    return this._primaryMUpsert(entities, updateOptions);
  }
  /**
   * Updates multiple entities
   * @param entities Entities to be updated
   * @param options Persistency options.
   * @returns Promise of entities updated.
   */
  public async mUpdate(entities: TEntity[], options?: Partial<PersistencyUpdateOptions>): Promise<any> {
    const updateOptions = new AntJsUpdateOptions(options);
    if (null != this._secondaryManager && !updateOptions.ignoreSecondaryLayer) {
      await this._secondaryManager.mUpdate(entities);
    }
    return this._primaryMUpsert(entities, updateOptions);
  }
  /**
   * Updates an entity
   * @param entity Entity to be updated
   * @param options Persistency options.
   * @returns Promise of entity updated.
   */
  public async update(entity: TEntity, options?: Partial<PersistencyUpdateOptions>): Promise<any> {
    const updateOptions = new AntJsUpdateOptions(options);
    if (null != this._secondaryManager && !updateOptions.ignoreSecondaryLayer) {
      await this._secondaryManager.update(entity);
    }
    return this._primaryUpsert(entity, updateOptions);
  }

  /**
   * Upserts multiple entities in the primary layer.
   * @param entities Entities to be upserted.
   * @param options Persistency options.
   * @returns Promise of entities upserted.
   */
  protected _primaryMUpsert(entities: TEntity[], options: PersistencyUpdateOptions): Promise<any> {
    if (options.ignorePrimaryLayer) {
      return Promise.resolve();
    } else {
      return this._primaryManager.mUpdate(entities, options);
    }
  }

  /**
   * Upserts an entity in the primary layer.
   * @param entity Entity to be upserted.
   * @param options Persistency options.
   * @returns Promise of entity upserted.
   */
  protected _primaryUpsert(entity: TEntity, options: PersistencyUpdateOptions): Promise<any> {
    if (options.ignorePrimaryLayer) {
      return Promise.resolve();
    } else {
      return this._primaryManager.update(entity, options);
    }
  }
}
