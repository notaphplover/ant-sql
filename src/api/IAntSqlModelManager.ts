import { IAntModelManager } from '@antjs/ant-js/src/api/IAntModelManager';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { ICacheOptions } from '@antjs/ant-js/src/persistence/primary/options/ICacheOptions';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';

export interface IAntSqlModelManager<TEntity extends IEntity>
  extends IAntModelManager<TEntity, IAntSqlModelConfig> {
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
