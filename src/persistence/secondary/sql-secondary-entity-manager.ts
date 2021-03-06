import * as Knex from 'knex';
import * as _ from 'lodash';
import { Entity } from '@antjs/ant-js';
import { SecondaryEntityManager } from './secondary-entity-manager';
import { SqlModel } from '../../model/sql-model';

export class SqlSecondaryEntityManager<TEntity extends Entity> implements SecondaryEntityManager<TEntity> {
  /**
   * Columns to select when performing a select query.
   */
  protected _columnsToSelect: string[];

  /**
   * Model to manage.
   */
  protected _model: SqlModel<TEntity>;

  /**
   * Query Builder.
   */
  protected _dbConnection: Knex;

  /**
   * Creates a new SQL secondary manager.
   * @param model Model to manage.
   * @param dbConnection SQL knex connection.
   */
  public constructor(model: SqlModel<TEntity>, dbConnection: Knex) {
    this._checkValidModel(model);

    this._columnsToSelect = this._getColumnsToSelect(model);
    this._dbConnection = dbConnection;
    this._model = model;
  }

  /**
   * Model to manage.
   */
  public get model(): SqlModel<TEntity> {
    return this._model;
  }

  /**
   * Deletes an entity from its id.
   * @param id Id of the entity to delete.
   * @returns Promise of entity deleted.
   */
  public delete(id: string | number): Promise<any> {
    return Promise.resolve(
      this._dbConnection
        .from(this.model.tableName)
        .where(this.model.id, id)
        .del(),
    );
  }

  /**
   * Gets an entity by its id.
   * @param id Id of the entity.
   * @returns Entity found
   */
  public getById(id: string | number): Promise<TEntity> {
    return this._dbConnection
      .select(this._columnsToSelect)
      .from(this.model.tableName)
      .where(this.model.id, id)
      .first()
      .then((result: any) => (null == result ? null : this.model.secondaryToEntity(result)));
  }
  /**
   * Finds a collection of entities by its ids.
   * @param ids Ids of the entities to find.
   * @returns Entities found.
   */
  public getByIds(ids: number[] | string[]): Promise<TEntity[]> {
    return this._dbConnection
      .select(this._columnsToSelect)
      .from(this.model.tableName)
      .whereIn(this.model.id, ids)
      .then((results: any[]) => this.model.mSecondaryToEntity(results));
  }

  /**
   * Gets a collection of models by its ids ordered by id asc.
   * @param ids Model ids.
   * @returns Models found.
   */
  public getByIdsOrderedAsc(ids: number[] | string[]): Promise<TEntity[]> {
    const ascOrder = 'ASC';
    return this._dbConnection
      .select(this._columnsToSelect)
      .from(this.model.tableName)
      .whereIn(this.model.id, ids)
      .orderBy(this.model.id, ascOrder)
      .then((results: any[]) => this.model.mSecondaryToEntity(results));
  }

  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @returns Promise of entity inserted.
   */
  public insert(entity: TEntity): Promise<any> {
    const insertionQueryBuilder: Knex.QueryBuilder = this._dbConnection
      .insert([this.model.entityToSecondary(entity)])
      .into(this.model.tableName);

    const autoGeneratedColumn = this.model.getAutoGeneratedColumn();
    if (null == autoGeneratedColumn) {
      return Promise.resolve(insertionQueryBuilder);
    } else {
      return insertionQueryBuilder.returning(autoGeneratedColumn.sqlName).then((value: any[]) => {
        (entity as Entity)[autoGeneratedColumn.entityAlias] = value[0];
      });
    }
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
    return Promise.resolve(
      this._dbConnection
        .from(this.model.tableName)
        .whereIn(this.model.id, ids)
        .del(),
    );
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
    const insertionQueryBuilder: Knex.QueryBuilder = this._dbConnection
      .insert(_.map(entities, (entity) => this.model.entityToSecondary(entity)))
      .into(this.model.tableName);

    const autoGeneratedColumn = this.model.getAutoGeneratedColumn();
    if (null == autoGeneratedColumn) {
      return Promise.resolve(insertionQueryBuilder);
    } else {
      return insertionQueryBuilder.returning(autoGeneratedColumn.sqlName).then((values: any[]) => {
        for (let i = 0; i < entities.length; ++i) {
          (entities[i] as Entity)[autoGeneratedColumn.entityAlias] = values[i];
        }
      });
    }
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
            .update(this.model.entityToSecondary(entity))
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
    return Promise.resolve(
      this._dbConnection(this.model.tableName)
        .where(this.model.id, entity[this.model.id])
        .update(this.model.entityToSecondary(entity)),
    );
  }

  /**
   * Gets the columns to select when performing select queries.
   * @param model Model to process.
   * @returns Columns to select.
   */
  protected _getColumnsToSelect(model: SqlModel<TEntity>): string[] {
    const columnsToSelect = new Array<string>();
    for (const column of model.columns) {
      columnsToSelect.push(column.sqlName);
    }
    return columnsToSelect;
  }

  /**
   * Checks if a model id valid and throws an exception in case it's not valid.
   */
  private _checkValidModel(model: SqlModel<TEntity>): void {
    if (undefined === model.columnByAlias(model.id)) {
      throw new Error(
        `Invalid model. A model must have a column matching with the id field.

The model defines an id field "${model.id}, but the model has no column with that alias."`,
      );
    }
  }
}
