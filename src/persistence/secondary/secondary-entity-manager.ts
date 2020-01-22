import { SecondaryEntityManager as AntJsSecondaryEntityManager } from '@antjs/ant-js/build/persistence/secondary/secondary-entity-manager';
import { Entity } from '@antjs/ant-js';

export interface SecondaryEntityManager<TEntity extends Entity> extends AntJsSecondaryEntityManager<TEntity> {
  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @returns Promise of entity inserted.
   */
  insert(entity: TEntity): Promise<any>;

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @returns Promise of entities inserted.
   */
  mInsert(entities: TEntity[]): Promise<any>;

  /**
   * Updates multiple entities.
   * @param entities Entities to be updated.
   * @returns Promise of entities updated.
   */
  mUpdate(entities: TEntity[]): Promise<any>;

  /**
   * Updates an entity.
   * @param entity Entity to be updated.
   * @returns Promise of entity deleted.
   */
  update(entity: TEntity): Promise<any>;
}
