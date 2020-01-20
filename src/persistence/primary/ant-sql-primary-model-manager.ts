import { AntPrimaryModelManager } from '@antjs/ant-js/build/persistence/primary/ant-primary-model-manager';
import { AntSqlDeleteOptions } from './options/ant-sql-delete-options';
import { AntSqlUpdateOptions } from './options/ant-sql-update-options';
import { Entity } from '@antjs/ant-js';
import { SecondaryEntityManager } from '../secondary/secondary-entity-manager';
import { SqlDeleteOptions } from './options/sql-delete-options';
import { SqlPrimaryModelManager } from './sql-primary-model-manager';
import { SqlUpdateOptions } from './options/sql-update-options';

export class AntSqlPrimaryModelManager<TEntity extends Entity>
  extends AntPrimaryModelManager<TEntity, SecondaryEntityManager<TEntity>>
  implements SqlPrimaryModelManager<TEntity> {
  /**
   * Deletes an entity from the cache layer.
   * @param id id of the entity to delete.
   * @param options persistency options.
   * @returns Promise of entity deleted.
   */
  public async delete(id: number | string, options: SqlDeleteOptions = new AntSqlDeleteOptions()): Promise<any> {
    if (options.persist) {
      await this._successor.delete(id);
    }
    if (options.ignoreCache) {
      return Promise.resolve();
    } else {
      return super.delete(id, options);
    }
  }

  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @param options persistency options.
   * @returns Promise of entity inserted.
   */
  public async insert(entity: TEntity, options: SqlUpdateOptions = new AntSqlUpdateOptions()): Promise<any> {
    if (options.persist) {
      await this._successor.insert(entity);
    }
    if (options.ignoreCache) {
      return entity;
    } else {
      return super.update(entity, options);
    }
  }

  /**
   * Deletes entitis from their ids.
   * @param ids Id of the entity to delete.
   * @param options persistency options.
   * @returns Promise of entities deleted.
   */
  public async mDelete(ids: number[] | string[], options: SqlDeleteOptions = new AntSqlDeleteOptions()): Promise<any> {
    if (options.persist) {
      await this._successor.mDelete(ids);
    }
    if (options.ignoreCache) {
      return Promise.resolve();
    } else {
      return super.mDelete(ids, options);
    }
  }

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @param options persistency options.
   * @returns Promise of entities inserted.
   */
  public async mInsert(entities: TEntity[], options: SqlUpdateOptions = new AntSqlUpdateOptions()): Promise<any> {
    if (options.persist) {
      await this._successor.mInsert(entities);
    }
    if (options.ignoreCache) {
      return entities;
    } else {
      return super.mUpdate(entities, options);
    }
  }

  /**
   * Updates multiple entities.
   * @param entities Entities to be updated.
   * @param options persistency options.
   * @returns Promise of entities updated.
   */
  public async mUpdate(entities: TEntity[], options: SqlUpdateOptions = new AntSqlUpdateOptions()): Promise<any> {
    if (options.persist) {
      await this._successor.mUpdate(entities);
    }
    if (options.ignoreCache) {
      return entities;
    } else {
      return super.mUpdate(entities, options);
    }
  }

  /**
   * Updates an entity.
   * @param entity Entity to be updated.
   * @param options persistency options.
   * @returns Promise of entity deleted.
   */
  public async update(entity: TEntity, options: SqlUpdateOptions = new AntSqlUpdateOptions()): Promise<any> {
    if (options.persist) {
      await this._successor.update(entity);
    }
    if (options.ignoreCache) {
      return entity;
    } else {
      return super.update(entity, options);
    }
  }
}
