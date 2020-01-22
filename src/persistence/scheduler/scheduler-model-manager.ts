import {
  SchedulerModelManager as AntJsSchedulerModelManager,
  SchedulerModelManagerBase as AntJsSchedulerModelManagerBase,
} from '@antjs/ant-js/build/persistence/scheduler/scheduler-model-manager';
import { Entity, PersistencyUpdateOptions } from '@antjs/ant-js';

export interface SchedulerModelManagerBase<TEntity extends Entity> extends AntJsSchedulerModelManagerBase<TEntity> {
  /**
   * Inserts an entity
   * @param entity Entity to be inserted.
   * @param options Persistency options.
   * @returns Promise of entity inserted.
   */
  insert(entity: TEntity, options?: Partial<PersistencyUpdateOptions>): Promise<any>;
  /**
   * Inserts multiple entities
   * @param entities Entities to be inserted
   * @param options Persistency options.
   * @returns Promise of entities inserted.
   */
  mInsert(entities: TEntity[], options?: Partial<PersistencyUpdateOptions>): Promise<any>;
  /**
   * Updates multiple entities
   * @param entities Entities to be updated
   * @param options Persistency options.
   * @returns Promise of entities updated.
   */
  mUpdate(entities: TEntity[], options?: Partial<PersistencyUpdateOptions>): Promise<any>;
  /**
   * Updates an entity
   * @param entity Entity to be updated
   * @param options Persistency options.
   * @returns Promise of entity updated.
   */
  update(entity: TEntity, options?: Partial<PersistencyUpdateOptions>): Promise<any>;
}

export interface SchedulerModelManager<TEntity extends Entity>
  extends AntJsSchedulerModelManager<TEntity>,
    SchedulerModelManagerBase<TEntity> {}
