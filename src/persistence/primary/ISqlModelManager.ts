import { IModelManager } from '@antjs/ant-js/src/persistence/primary/IModelManager';
import { ICacheOptions } from '@antjs/ant-js/src/persistence/primary/options/ICacheOptions';

export interface ISqlModelManager<TEntity> extends IModelManager<TEntity> {
  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @returns Promise of entity inserted.
   */
  insert(entity: TEntity, cacheOptions?: ICacheOptions): Promise<any>;

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @returns Promise of entities inserted.
   */
  mInsert(entities: TEntity[], cacheOptions?: ICacheOptions): Promise<any>;
}
