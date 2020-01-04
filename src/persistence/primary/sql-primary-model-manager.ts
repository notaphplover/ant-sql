import { Entity } from '@antjs/ant-js';
import { PrimaryModelManager } from '@antjs/ant-js/build/persistence/primary/primary-model-manager';
import { SqlDeleteOptions } from './options/sql-delete-options';
import { SqlInsertable } from './sql-insertable';
import { SqlUpdateOptions } from './options/sql-update-options';

export interface SqlPrimaryModelManager<TEntity extends Entity>
  extends PrimaryModelManager<TEntity>,
    SqlInsertable<TEntity> {
  /**
   * Deletes an entity from the cache layer.
   * @param id id of the entity to delete.
   * @param options persistency options.
   * @returns Promise of entity deleted.
   */
  delete(id: number | string, options?: SqlDeleteOptions): Promise<any>;

  /**
   * Deletes entitis from their ids.
   * @param ids Id of the entity to delete.
   * @param options persistency options.
   * @returns Promise of entities deleted.
   */
  mDelete(ids: number[] | string[], options?: SqlDeleteOptions): Promise<any>;

  /**
   * Updates multiple entities.
   * @param entities Entities to be updated.
   * @param options persistency options.
   * @returns Promise of entities updated.
   */
  mUpdate(entities: TEntity[], options?: SqlUpdateOptions): Promise<any>;

  /**
   * Updates an entity.
   * @param entity Entity to be updated.
   * @param options persistency options.
   * @returns Promise of entity deleted.
   */
  update(entity: TEntity, options?: SqlUpdateOptions): Promise<any>;
}
