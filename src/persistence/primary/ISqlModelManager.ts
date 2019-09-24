import { IModelManager } from '@antjs/ant-js/src/persistence/primary/IModelManager';
import { IAntSqlUpdateOptions } from './options/IAntSqlUpdateOptions';
import { IAntSqlDeleteOptions } from './options/IAntSqlDeleteOptions';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { ISqlInsertable } from './ISqlInsertable';

export interface ISqlModelManager<TEntity extends IEntity>
  extends IModelManager<TEntity>, ISqlInsertable<TEntity> {

  /**
   * Deletes an entity from the cache layer.
   * @param id id of the entity to delete.
   * @param options persistency options.
   * @returns Promise of entity deleted.
   */
  delete(id: number | string, options?: IAntSqlDeleteOptions): Promise<any>;

  /**
   * Deletes entitis from their ids.
   * @param ids Id of the entity to delete.
   * @param options persistency options.
   * @returns Promise of entities deleted.
   */
  mDelete(ids: number[] | string[], options?: IAntSqlDeleteOptions): Promise<any>;

  /**
   * Updates multiple entities.
   * @param entities Entities to be updated.
   * @param options persistency options.
   * @returns Promise of entities updated.
   */
  mUpdate(entities: TEntity[], options?: IAntSqlUpdateOptions): Promise<any>;

  /**
   * Updates an entity.
   * @param entity Entity to be updated.
   * @param options persistency options.
   * @returns Promise of entity deleted.
   */
  update(entity: TEntity, options?: IAntSqlUpdateOptions): Promise<any>;
}
