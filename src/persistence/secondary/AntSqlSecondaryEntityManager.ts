import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { ISecondaryEntityManager } from '@antjs/ant-js/src/persistence/secondary/ISecondaryEntityManager';
import * as Knex from 'knex';
import { IAntSqlModel } from '../../model/IAntSqlModel';

export class AntSqlSecondaryEntityManager<TEntity extends IEntity>
  implements ISecondaryEntityManager<TEntity> {

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
}
