import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { ModelManager } from '@antjs/ant-js/src/persistence/primary/ModelManager';
import { ISqlSecondaryEntityManager } from '../secondary/ISqlSecondaryEntityManager';
import { ISqlModelManager } from './ISqlModelManager';
import { AntSqlDeleteOptions } from './options/AntSqlDeleteOptions';
import { AntSqlUpdateOptions } from './options/AntSqlUpdateOptions';
import { IAntSqlDeleteOptions } from './options/IAntSqlDeleteOptions';
import { IAntSqlUpdateOptions } from './options/IAntSqlUpdateOptions';

export class SqlModelManager<TEntity extends IEntity> extends ModelManager<
  TEntity,
  ISqlSecondaryEntityManager<TEntity>
> implements ISqlModelManager<TEntity> {

  /**
   * Deletes an entity from the cache layer.
   * @param id id of the entity to delete.
   * @param options persistency options.
   * @returns Promise of entity deleted.
   */
  public async delete(
    id: number | string,
    options: IAntSqlDeleteOptions = new AntSqlDeleteOptions(),
  ): Promise<any> {
    if (options.persist) {
      await this._successor.delete(id);
    }
    return super.delete(id);
  }

  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @param options persistency options.
   * @returns Promise of entity inserted.
   */
  public async insert(
    entity: TEntity,
    options: IAntSqlUpdateOptions = new AntSqlUpdateOptions(),
  ): Promise<any> {
    if (options.persist) {
      await this._successor.insert(entity);
    }
    return super.update(entity, options);
  }

  /**
   * Deletes entitis from their ids.
   * @param ids Id of the entity to delete.
   * @param options persistency options.
   * @returns Promise of entities deleted.
   */
  public async mDelete(
    ids: number[] | string[],
    options: IAntSqlDeleteOptions = new AntSqlDeleteOptions(),
  ): Promise<any> {
    if (options.persist) {
      await this._successor.mDelete(ids);
    }
    return super.mDelete(ids);
  }

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @param options persistency options.
   * @returns Promise of entities inserted.
   */
  public async mInsert(
    entities: TEntity[],
    options: IAntSqlUpdateOptions = new AntSqlUpdateOptions(),
  ): Promise<any> {
    if (options.persist) {
      await this._successor.mInsert(entities);
    }
    return super.mUpdate(entities, options);
  }

  /**
   * Updates multiple entities.
   * @param entities Entities to be updated.
   * @param options persistency options.
   * @returns Promise of entities updated.
   */
  public async mUpdate(
    entities: TEntity[],
    options: IAntSqlUpdateOptions = new AntSqlUpdateOptions(),
  ): Promise<any> {
    if (options.persist) {
      await this._successor.mUpdate(entities);
    }
    return super.mUpdate(entities, options);
  }

  /**
   * Updates an entity.
   * @param entity Entity to be updated.
   * @param options persistency options.
   * @returns Promise of entity deleted.
   */
  public async update(
    entity: TEntity,
    options: IAntSqlUpdateOptions = new AntSqlUpdateOptions(),
  ): Promise<any> {
    if (options.persist) {
      await this._successor.update(entity);
    }
    return super.update(entity, options);
  }
}
