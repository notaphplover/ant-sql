import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { IAntSqlUpdateOptions } from './options/IAntSqlUpdateOptions';

export interface ISqlInsertable<TEntity extends IEntity> {
  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @param options persistency options.
   * @returns Promise of entity inserted.
   */
  insert(entity: TEntity, options?: IAntSqlUpdateOptions): Promise<any>;

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @param options persistency options.
   * @returns Promise of entities inserted.
   */
  mInsert(entities: TEntity[], options?: IAntSqlUpdateOptions): Promise<any>;
}
