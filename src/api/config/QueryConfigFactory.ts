import { IAntQueryConfig } from '@antjs/ant-js/src/api/config/IAntQueryConfig';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import {
  MultipleQueryResult,
  SingleQueryResult,
  TQuery,
} from '@antjs/ant-js/src/persistence/primary/query/PrimaryQueryManager';
import * as Knex from 'knex';
import { IAntSQLColumn } from '../../model/IAntSQLColumn';
import { IAntSqlModel } from '../../model/IAntSqlModel';

export class QueryConfigFactory<TEntity extends IEntity> {

  /**
   * Knex connection.
   */
  protected _knex: Knex;
  /**
   * Model to manage.
   */
  protected _model: IAntSqlModel;

  /**
   * Creates a query config factory.
   * @param knex Knex connection.
   * @param model Queries model.
   */
  public constructor(knex: Knex, model: IAntSqlModel) {
    this._knex = knex;
    this._model = model;
  }

  /**
   * Creates a query of all entities of a certain model.
   * @param queryPrefix Query prefix used to generate Redis keys.
   * @returns Query config.
   */
  public all(queryPrefix: string): IAntQueryConfig<TEntity, MultipleQueryResult>;
  /**
   * Creates a query of all entities of a certain model.
   * @param queryPrefix Query prefix used to generate Redis keys.
   * @returns Query config.
   */
  public all<TQueryResult extends MultipleQueryResult>(
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, TQueryResult> {
    return {
      isMultiple: true,
      query: this._buildAllIdsQuery<TQueryResult>(),
      queryKeyGen: () => queryPrefix,
      reverseHashKey: queryPrefix + 'reverse',
    };
  }

  /**
   * Creates a query of entities by a single field.
   * @param column Query column.
   * @param queryPrefix Query prefix.
   * @returns Query config.
   */
  public byField(
    column: IAntSQLColumn,
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, MultipleQueryResult>;
  /**
   * Creates a query of entities by a single field.
   * @param column Query column.
   * @param queryPrefix Query prefix.
   * @returns Query config.
   */
  public byField<TQueryResult extends MultipleQueryResult>(
    column: IAntSQLColumn,
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, TQueryResult> {
    return {
      isMultiple: true,
      mQuery: this._buildIdsByFieldsQuery<TQueryResult>(column),
      query: this._buildIdsByFieldQuery<TQueryResult>(column),
      queryKeyGen: (params: any) => queryPrefix + params[column.entityAlias],
      reverseHashKey: queryPrefix + 'reverse',
    };
  }

  /**
   * Creates a query of entities by an unique field.
   * @param column Query column.
   * @param queryPrefix Query prefix.
   * @returns Query config.
   */
  public byUniqueField(
    column: IAntSQLColumn,
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, SingleQueryResult>;
  /**
   * Creates a query of entities by an unique field.
   * @param column Query column.
   * @param queryPrefix Query prefix.
   * @returns Query config.
   */
  public byUniqueField<TQueryResult extends SingleQueryResult>(
    column: IAntSQLColumn,
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, TQueryResult> {
    return {
      isMultiple: false,
      mQuery: this._buildIdsByUniqueFieldsQuery<TQueryResult>(column),
      query: this._buildIdsByUniqueFieldQuery<TQueryResult>(column),
      queryKeyGen: (params: any) => queryPrefix + params[column.entityAlias],
      reverseHashKey: queryPrefix + 'reverse',
    };
  }

  /**
   * Creates an all ids query.
   * @returns query built.
   */
  private _buildAllIdsQuery<TQueryResult extends MultipleQueryResult>(): TQuery<TQueryResult> {
    return () => {
      return this._createAllEntitiesIdsQuery()
        .then(
          (results: TEntity[]) => results.map((result) => result[this._model.id]) as TQueryResult,
        );
    };
  }

  /**
   * Creates an ids by field query.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByFieldQuery<TQueryResult extends MultipleQueryResult>(
    column: IAntSQLColumn,
  ): TQuery<TQueryResult> {
    return (params: any) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      const fieldValue: string = params[column.entityAlias];
      if (!fieldValue) {
        throw new Error('Expected a field value!');
      }
      return this._createEntitiesByFieldQuery(column, fieldValue)
        .then(
          (results: TEntity[]) => results.map((result) => result[this._model.id]) as TQueryResult,
        );
    };
  }

  /**
   * Creates an ids by fields query.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByFieldsQuery<TQueryResult extends MultipleQueryResult>(
    column: IAntSQLColumn,
  ): TQuery<TQueryResult[]> {
    return (params: any[]) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      if (0 === params.length) {
        return new Promise<TQueryResult[]>((resolve) => { resolve(new Array()); });
      }
      const valuesArray = params.map((params: any) => params[column.entityAlias]);
      const valuesMap = this._buildIdsByFieldsQueryBuildValuesMap(valuesArray);
      return this._createEntitiesByFieldMQueryWithField(column, valuesArray)
        .then(
          this._buildIdsByFieldsQueryBuildPromiseCallback<TQueryResult>(
            column, valuesMap, valuesArray.length,
          ),
        );
    };
  }
  /**
   * Creates a promise callback to handle the results query response.
   * @param column AntSql column.
   * @param valuesMap Values map.
   * @param valuesLength values length.
   * @returns promise callback to handle the results query response.
   */
  private _buildIdsByFieldsQueryBuildPromiseCallback<TQueryResult extends MultipleQueryResult>(
    column: IAntSQLColumn,
    valuesMap: Map<any, number[]>,
    valuesLength: number,
  ): (results: TEntity[]) => TQueryResult[] {
    return (results: TEntity[]) => {
      const finalResults: TQueryResult[] = new Array();
      for (let i = 0; i < valuesLength; ++i) {
        finalResults[i] = new Array() as TQueryResult;
      }
      for (const result of results) {
        const id = result[this._model.id];
        const value = result[column.sqlName];
        const indexes = valuesMap.get(value);
        for (const index of indexes) {
          (finalResults[index] as Array<any>).push(id);
        }
      }
      return finalResults;
    };
  }
  /**
   * Builds a values-to-indexes map from a values array.
   * @param valuesArray Values array.
   */
  private _buildIdsByFieldsQueryBuildValuesMap(
    valuesArray: any[],
  ): Map<any, number[]> {
    const valuesMap = new Map<any, number[]>();
    for (let i = 0; i < valuesArray.length; ++i) {
      const value = valuesArray[i];
      let entry = valuesMap.get(value);
      if (undefined === entry) {
        entry = new Array();
        valuesMap.set(value, entry);
      }
      entry.push(i);
    }
    return valuesMap;
  }

  /**
   * Creates an ids by unique field query.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByUniqueFieldQuery<TQueryResult extends SingleQueryResult>(
    column: IAntSQLColumn,
  ): TQuery<TQueryResult> {
    return (params: any) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      const fieldValue: string = params[column.entityAlias];
      if (!fieldValue) {
        throw new Error('Expected a value!');
      }
      return this._createEntitiesByFieldQuery(column, fieldValue)
        .first()
        .then(
          (result: TEntity) => result ? result[this._model.id] as TQueryResult : null,
        );
    };
  }

  /**
   * Creates an ids by unique field query.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByUniqueFieldsQuery<TQueryResult extends SingleQueryResult>(
    column: IAntSQLColumn,
  ): TQuery<TQueryResult[]> {
    return (params: any) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      if (0 === params.length) {
        return new Promise<TQueryResult[]>((resolve) => { resolve(new Array()); });
      }
      const valuesArray = params.map((params: any) => params[column.entityAlias]);
      return this._createEntitiesByFieldMQuery(column, valuesArray)
        .then(
          (results: TEntity[]) => results.map((result) => result[this._model.id]) as TQueryResult[],
        );
    };
  }

  /**
   * Creates an all query.
   * @returns query builder.
   */
  private _createAllEntitiesIdsQuery(): Knex.QueryBuilder {
    return this._knex
      .select(this._model.id)
      .from(this._model.tableName);
  }

  /**
   * Creates a query by field value.
   * @param column Query column.
   * @param value Entity value.
   */
  private _createEntitiesByFieldMQuery(
    column: IAntSQLColumn,
    values: any[],
  ): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery()
      .whereIn(column.sqlName, values);
  }

  /**
   * Creates a query by field value.
   * @param column Query column.
   * @param value Entity value.
   */
  private _createEntitiesByFieldMQueryWithField(
    column: IAntSQLColumn,
    values: any[],
  ): Knex.QueryBuilder {
    return this._knex
      .select(this._model.id, column.sqlName)
      .from(this._model.tableName)
      .whereIn(column.sqlName, values);
  }

  /**
   * Creates a query by field value.
   * @param column Query column.
   * @param value Entity value.
   */
  private _createEntitiesByFieldQuery(
    column: IAntSQLColumn,
    value: any,
  ): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery()
      .where(column.sqlName, value);
  }
}
