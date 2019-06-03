import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import * as Knex from 'knex';
import { IAntSqlModel } from '../../model/IAntSqlModel';
import { ISqlSecondaryEntityManager } from './ISqlSecondaryEntityManager';

export class AntSqlSecondaryEntityManager<TEntity extends IEntity>
  implements ISqlSecondaryEntityManager<TEntity> {

  /**
   * Model to manage.
   */
  protected _model: IAntSqlModel;

  /**
   * Query Builder.
   */
  protected _dbConnection: Knex;

  /**
   * Creates a new SQL secondary manager.
   * @param model Model to manage.
   * @param dbConnection SQL knex connection.
   */
  public constructor(
    model: IAntSqlModel,
    dbConnection: Knex,
  ) {
    this._model = model;
    this._dbConnection = dbConnection;
  }

  /**
   * Model to manage.
   */
  public get model(): IAntSqlModel {
    return this._model;
  }

  /**
   * Deletes an entity from its id.
   * @param id Id of the entity to delete.
   * @returns Promise of entity deleted.
   */
  public delete(id: string | number): Promise<any> {
    return this
        ._dbConnection
        .from(this.model.tableName)
        .where(this.model.id, id)
        .del();
  }

  /**
   * Gets an entity by its id.
   * @param id Id of the entity.
   * @returns Entity found
   */
  public getById(id: string | number): Promise<TEntity> {
    return new Promise<TEntity>((resolve, reject) => {
      this
        ._dbConnection
        .from(this.model.tableName)
        .where(this.model.id, id)
        .then((results: any[]) => {
          if (0 === results.length) {
            resolve(null);
          } else {
            resolve(results[0]);
          }
        }).catch(reject);
    });
  }
  /**
   * Finds a collection of entities by its ids.
   * @param ids Ids of the entities to find.
   * @returns Entities found.
   */
  public getByIds(ids: number[] | string[]): Promise<TEntity[]> {
    return new Promise<TEntity[]>((resolve, reject) => {
      this
        ._dbConnection
        .from(this.model.tableName)
        .whereIn(this.model.id, ids)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Gets a collection of models by its ids ordered by id asc.
   * @param ids Model ids.
   * @returns Models found.
   */
  public getByIdsOrderedAsc(ids: number[]| string[]): Promise<TEntity[]> {
    const ascOrder = 'ASC';
    return new Promise<TEntity[]>((resolve, reject) => {
      this
        ._dbConnection
        .from(this.model.tableName)
        .whereIn(this.model.id, ids)
        .orderBy(this.model.id, ascOrder)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @returns Promise of entity inserted.
   */
  public insert(entity: TEntity): Promise<any> {
    return this
        ._dbConnection
        .insert([this._buildKnexObject(this.model, entity)])
        .into((this.model.tableName));
  }

  /**
   * Deletes entitis from their ids.
   * @param ids Id of the entity to delete.
   * @returns Promise of entities deleted.
   */
  public mDelete(ids: string[] | number[]): Promise<any> {
    if (0 === ids.length) {
      return new Promise((resolve) => resolve());
    }
    return this
        ._dbConnection
        .from(this.model.tableName)
        .whereIn(this.model.id, ids)
        .del();
  }

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @returns Promise of entities inserted.
   */
  public mInsert(entities: TEntity[]): Promise<any> {
    return this
        ._dbConnection
        .insert(entities.map(
          (entity) => this._buildKnexObject(this.model, entity),
        ))
        .into((this.model.tableName));
  }

  /**
   * Updates multiple entities.
   * @param entities Entities to be updated.
   * @returns Promise of entities updated.
   */
  public mUpdate(entities: TEntity[]): Promise<any> {
    if (0 === entities.length) {
      return new Promise((resolve) => resolve());
    }
    return this
      ._dbConnection
      .transaction((transaction) => {
        const queries = new Array<Knex.QueryBuilder>();
        for (const entity of entities) {
          queries.push(
            this
              ._dbConnection(this.model.tableName)
              .where(this.model.id, entity[this.model.id])
              .update(this._buildKnexObject(this.model, entity))
              .transacting(transaction),
          );
        }
        Promise.all(queries)
          .then(transaction.commit)
          .catch(transaction.rollback);
      });
  }

  /**
   * Updates an entity.
   * @param entity Entity to be updated.
   * @returns Promise of entity deleted.
   */
  public update(entity: TEntity): Promise<any> {
    return this
      ._dbConnection(this.model.tableName)
      .where(this.model.id, entity[this.model.id])
      .update(this._buildKnexObject(this.model, entity));
  }

  /**
   * Builds a Knex object that is equivalent of an entity.
   * @param model Model of the entity to process.
   * @param entity Entity to use in the build.
   */
  private _buildKnexObject(model: IAntSqlModel, entity: TEntity): {[key: string]: any} {
    const updateObject: {[key: string]: any} = {};
    for (const [, columnData] of model.columns) {
      const entityValue = entity[columnData.entityAlias];
      if (undefined !== entityValue) {
        updateObject[columnData.sqlName] = entityValue;
      }
    }
    return updateObject;
  }
}
