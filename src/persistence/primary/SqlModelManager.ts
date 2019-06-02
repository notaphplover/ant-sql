import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { ModelManager } from '@antjs/ant-js/src/persistence/primary/ModelManager';
import { ICacheOptions } from '@antjs/ant-js/src/persistence/primary/options/ICacheOptions';
import { ISqlSecondaryEntityManager } from '../secondary/ISqlSecondaryEntityManager';
import { ISqlModelManager } from './ISqlModelManager';

export class SqlModelManager<TEntity extends IEntity> extends ModelManager<
  TEntity,
  ISqlSecondaryEntityManager<TEntity>
> implements ISqlModelManager<TEntity> {

  /**
   * Deletes an entity from the cache layer.
   * @param id id of the entity to delete.
   * @returns Promise of entity deleted.
   */
  public delete(id: number | string): Promise<any> {
    return this._successor.delete(id).then(() => super.delete(id));
  }

  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @returns Promise of entity inserted.
   */
  public insert(entity: TEntity, cacheOptions?: ICacheOptions): Promise<any> {
    return this._successor.insert(entity).then(() => super.update(entity, cacheOptions));
  }

  /**
   * Deletes entitis from their ids.
   * @param ids Id of the entity to delete.
   * @returns Promise of entities deleted.
   */
  public mDelete(ids: number[] | string[]): Promise<any> {
    return this._successor.mDelete(ids).then(() => super.mDelete(ids));
  }

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @returns Promise of entities inserted.
   */
  public mInsert(entities: TEntity[], cacheOptions?: ICacheOptions): Promise<any> {
    return this._successor.mInsert(entities).then(() => super.mUpdate(entities, cacheOptions));
  }

  /**
   * Updates multiple entities.
   * @param entities Entities to be updated.
   * @returns Promise of entities updated.
   */
  public mUpdate(entities: TEntity[], cacheOptions?: ICacheOptions): Promise<any> {
    return this._successor.mUpdate(entities).then(() => super.mUpdate(entities, cacheOptions));
  }

  /**
   * Updates an entity.
   * @param entity Entity to be updated.
   * @returns Promise of entity deleted.
   */
  public update(entity: TEntity, cacheOptions?: ICacheOptions): Promise<any> {
    return this._successor.update(entity).then(() => super.update(entity, cacheOptions));
  }
}
