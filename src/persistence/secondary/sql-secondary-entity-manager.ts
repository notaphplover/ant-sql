import { Entity } from '@antjs/ant-js';
import * as Knex from 'knex';
import { SqlModel } from '../../model/sql-model';
import { SecondaryEntityManager } from './secondary-entity-manager';
import { SecondaryEntityManagerHelper } from './seconday-entity-manager-helper';

export class SqlSecondaryEntityManager<TEntity extends Entity> implements SecondaryEntityManager<TEntity> {
  /**
   * Secondary entity manager helper.
   */
  protected _helper: SecondaryEntityManagerHelper<TEntity>;

  /**
   * Model to manage.
   */
  protected _model: SqlModel;

  /**
   * Query Builder.
   */
  protected _dbConnection: Knex;

  /**
   * Creates a new SQL secondary manager.
   * @param model Model to manage.
   * @param dbConnection SQL knex connection.
   */
  public constructor(model: SqlModel, dbConnection: Knex) {
    this._dbConnection = dbConnection;
    this._helper = new SecondaryEntityManagerHelper(model, dbConnection);
    this._model = model;
  }

  /**
   * Model to manage.
   */
  public get model(): SqlModel {
    return this._model;
  }

  /**
   * Deletes an entity from its id.
   * @param id Id of the entity to delete.
   * @returns Promise of entity deleted.
   */
  public delete(id: string | number): Promise<any> {
    return this._dbConnection
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
      this._dbConnection
        .from(this.model.tableName)
        .where(this.model.id, id)
        .then((results: any[]) => {
          if (0 === results.length) {
            resolve(null);
          } else {
            resolve(results[0]);
          }
        })
        .catch(reject);
    });
  }
  /**
   * Finds a collection of entities by its ids.
   * @param ids Ids of the entities to find.
   * @returns Entities found.
   */
  public getByIds(ids: number[] | string[]): Promise<TEntity[]> {
    return new Promise<TEntity[]>((resolve, reject) => {
      this._dbConnection
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
  public getByIdsOrderedAsc(ids: number[] | string[]): Promise<TEntity[]> {
    const ascOrder = 'ASC';
    return new Promise<TEntity[]>((resolve, reject) => {
      this._dbConnection
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
    let insertionPromise: Promise<any> = this._dbConnection
      .insert([this._helper.buildKnexObject(this.model, entity)])
      .into(this.model.tableName);

    const autoGeneratedColumn = this.model.getAutoGeneratedColumn();
    if (null !== autoGeneratedColumn) {
      insertionPromise = (insertionPromise as Knex.QueryBuilder)
        .returning(autoGeneratedColumn.sqlName)
        .then((value: any[]) => {
          (entity as Entity)[autoGeneratedColumn.entityAlias] = value[0];
        });
    }
    return insertionPromise;
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
    return this._dbConnection
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
    if (0 === entities.length) {
      return new Promise((resolve) => resolve());
    }
    let insertionPromise: Promise<any> = this._dbConnection
      .insert(entities.map((entity) => this._helper.buildKnexObject(this.model, entity)))
      .into(this.model.tableName);

    const autoGeneratedColumn = this.model.getAutoGeneratedColumn();
    if (null != autoGeneratedColumn) {
      insertionPromise = (insertionPromise as Knex.QueryBuilder)
        .returning(autoGeneratedColumn.sqlName)
        .then((values: any[]) => {
          for (let i = 0; i < entities.length; ++i) {
            if (null != values[i]) {
              (entities[i] as Entity)[autoGeneratedColumn.entityAlias] = values[i];
            }
          }
        });
    }

    return insertionPromise;
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
    return this._dbConnection.transaction((transaction) => {
      const queries = new Array<Knex.QueryBuilder<any, number>>();
      for (const entity of entities) {
        queries.push(
          this._dbConnection(this.model.tableName)
            .where(this.model.id, entity[this.model.id])
            .update(this._helper.buildKnexObject(this.model, entity))
            .transacting(transaction),
        );
      }
      Promise.all(queries)
        .then(() => transaction.commit())
        .catch(transaction.rollback);
    });
  }

  /**
   * Updates an entity.
   * @param entity Entity to be updated.
   * @returns Promise of entity deleted.
   */
  public update(entity: TEntity): Promise<any> {
    return this._dbConnection(this.model.tableName)
      .where(this.model.id, entity[this.model.id])
      .update(this._helper.buildKnexObject(this.model, entity));
  }
}