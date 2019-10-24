import { Entity } from '@antjs/ant-js';
import { SqlUpdateOptions } from './options/sql-update-options';

export interface SqlInsertable<TEntity extends Entity> {
  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @param options persistency options.
   * @returns Promise of entity inserted.
   */
  insert(entity: TEntity, options?: SqlUpdateOptions): Promise<any>;

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @param options persistency options.
   * @returns Promise of entities inserted.
   */
  mInsert(entities: TEntity[], options?: SqlUpdateOptions): Promise<any>;
}
