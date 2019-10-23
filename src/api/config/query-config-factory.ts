import { ApiQueryConfig, Entity } from '@antjs/ant-js';
import {
  MultipleQueryResult,
  SingleQueryResult,
  TQuery,
} from '@antjs/ant-js/src/persistence/primary/query/ant-primary-query-manager';
import * as Knex from 'knex';
import { ApiSqlColumn } from '../../model/api-sql-column';
import { IAntSqlModel } from '../../model/IAntSqlModel';
import { ApiCfgGenOptions } from './api-config-generation-options';

export class QueryConfigFactory<TEntity extends Entity> {
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
   * @param options Config generation options
   * @returns Query config.
   */
  public all<TQueryResult extends MultipleQueryResult>(
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    const queryAlias = 'all/';
    options = this._processCfgGenOptions(options, () => this._model.keyGen.prefix + queryAlias, queryAlias);

    return {
      entityKeyGen: options.entityKeyGen,
      isMultiple: true,
      query: this._buildAllIdsQuery<TQueryResult>(),
      queryKeyGen: options.queryKeyGen,
      reverseHashKey: options.reverseHashKey,
    };
  }

  /**
   * Creates a query of entities by a single field.
   * @param column Query column.
   * @param options Config generation options
   * @returns Query config.
   */
  public byField<TQueryResult extends MultipleQueryResult>(
    column: ApiSqlColumn,
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    const queryAlias = 'f_' + column.entityAlias + '/';
    options = this._processCfgGenOptions(
      options,
      (params: any) => this._model.keyGen.prefix + queryAlias + params[column.entityAlias],
      queryAlias,
    );
    return {
      entityKeyGen: options.entityKeyGen,
      isMultiple: true,
      mQuery: this._buildIdsByFieldMQuery<TQueryResult>(column),
      query: this._buildIdsByFieldQuery<TQueryResult>(column),
      queryKeyGen: options.entityKeyGen,
      reverseHashKey: options.reverseHashKey,
    };
  }

  /**
   * Creates a query of entities by multiple fields.
   * @param columns columns to filter.
   * @param options config generation options.
   * @returns Query of entities by multiple fields.
   */
  public byFields<TQueryResult extends MultipleQueryResult>(
    columns: ApiSqlColumn[],
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    const separator = '/';
    const queryAlias = 'mf_' + columns.reduce((previous, next) => previous + separator + next.entityAlias, '');
    options = this._processCfgGenOptions(
      options,
      (params: any) =>
        columns.reduce((previous, next) => previous + params[next.entityAlias], this._model.keyGen.prefix + queryAlias),
      queryAlias,
    );
    return {
      entityKeyGen: options.entityKeyGen,
      isMultiple: true,
      query: this._buildIdsByFieldsQuery<TQueryResult>(columns),
      queryKeyGen: options.entityKeyGen,
      reverseHashKey: options.reverseHashKey,
    };
  }

  /**
   * Creates a query of entities by an unique field.
   * @param column Query column.
   * @param options Config generation options
   * @returns Query config.
   */
  public byUniqueField<TQueryResult extends SingleQueryResult>(
    column: ApiSqlColumn,
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    const queryAlias = 'uf_' + column.entityAlias + '/';
    options = this._processCfgGenOptions(
      options,
      (params: any) => this._model.keyGen.prefix + queryAlias + params[column.entityAlias],
      queryAlias,
    );
    return {
      entityKeyGen: options.entityKeyGen,
      isMultiple: false,
      mQuery: this._buildIdsByUniqueFieldMQuery<TQueryResult>(column),
      query: this._buildIdsByUniqueFieldQuery<TQueryResult>(column),
      queryKeyGen: options.queryKeyGen,
      reverseHashKey: options.reverseHashKey,
    };
  }

  /**
   * Creates a query of entities by multiple fields.
   * @param columns columns to filter.
   * @param options config generation options.
   * @returns Query of entities by multiple fields.
   */
  public byUniqueFields<TQueryResult extends SingleQueryResult>(
    columns: ApiSqlColumn[],
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    const separator = '/';
    const queryAlias = 'umf_' + columns.reduce((previous, next) => previous + separator + next.entityAlias, '');
    options = this._processCfgGenOptions(
      options,
      (params: any) =>
        columns.reduce((previous, next) => previous + params[next.entityAlias], this._model.keyGen.prefix + queryAlias),
      queryAlias,
    );

    return {
      entityKeyGen: options.entityKeyGen,
      isMultiple: false,
      query: this._buildIdsByUniqueFieldsQuery<TQueryResult>(columns),
      queryKeyGen: options.queryKeyGen,
      reverseHashKey: options.reverseHashKey,
    };
  }

  /**
   * Creates an all ids query.
   * @returns query built.
   */
  private _buildAllIdsQuery<TQueryResult extends MultipleQueryResult>(): TQuery<TQueryResult> {
    return () => {
      return this._createAllEntitiesIdsQuery().then(
        (results: TEntity[]) => results.map((result) => result[this._model.id]) as TQueryResult,
      );
    };
  }

  /**
   * Creates an ids by field mquery.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByFieldMQuery<TQueryResult extends MultipleQueryResult>(
    column: ApiSqlColumn,
  ): TQuery<TQueryResult[]> {
    return (params: any[]) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      if (0 === params.length) {
        return new Promise<TQueryResult[]>((resolve) => {
          resolve(new Array());
        });
      }
      const valuesArray = params.map((params: any) => params[column.entityAlias]);
      const valuesMap = this._buildIdsByFieldMQueryBuildValuesMap(valuesArray);
      return this._createEntitiesByFieldMQueryWithField(column, valuesArray).then(
        this._buildIdsByFieldMQueryBuildPromiseCallback<TQueryResult>(column, valuesMap, valuesArray.length),
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
  private _buildIdsByFieldMQueryBuildPromiseCallback<TQueryResult extends MultipleQueryResult>(
    column: ApiSqlColumn,
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
          (finalResults[index] as any[]).push(id);
        }
      }
      return finalResults;
    };
  }
  /**
   * Builds a values-to-indexes map from a values array.
   * @param valuesArray Values array.
   */
  private _buildIdsByFieldMQueryBuildValuesMap(valuesArray: any[]): Map<any, number[]> {
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
   * Creates an ids by field query.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByFieldQuery<TQueryResult extends MultipleQueryResult>(column: ApiSqlColumn): TQuery<TQueryResult> {
    return (params: any) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      const fieldValue: string = params[column.entityAlias];
      if (!fieldValue) {
        throw new Error('Expected a field value!');
      }
      return this._createEntitiesByFieldQuery(column, fieldValue).then(
        (results: TEntity[]) => results.map((result) => result[this._model.id]) as TQueryResult,
      );
    };
  }

  /**
   * Builds an ids by fields query.
   * @param columns Columns to filter.
   * @returns Ids by fields query.
   */
  private _buildIdsByFieldsQuery<TQueryResult extends MultipleQueryResult>(
    columns: ApiSqlColumn[],
  ): TQuery<TQueryResult> {
    return (params: any) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      return this._createEntitiesByFieldsQuery(columns, params).then(
        (results: TEntity[]) => results.map((result) => result[this._model.id]) as TQueryResult,
      );
    };
  }

  /**
   * Creates an ids by unique field query.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByUniqueFieldMQuery<TQueryResult extends SingleQueryResult>(
    column: ApiSqlColumn,
  ): TQuery<TQueryResult[]> {
    return (params: any) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      if (0 === params.length) {
        return new Promise<TQueryResult[]>((resolve) => {
          resolve(new Array());
        });
      }
      const valuesArray = params.map((params: any) => params[column.entityAlias]);
      return this._createEntitiesByFieldMQuery(column, valuesArray).then(
        (results: TEntity[]) => results.map((result) => result[this._model.id]) as TQueryResult[],
      );
    };
  }

  /**
   * Creates an ids by unique field query.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByUniqueFieldQuery<TQueryResult extends SingleQueryResult>(
    column: ApiSqlColumn,
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
        .then((result: TEntity) => (result ? (result[this._model.id] as TQueryResult) : null));
    };
  }

  /**
   * Creates an ids by unique field query.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByUniqueFieldsQuery<TQueryResult extends SingleQueryResult>(
    columns: ApiSqlColumn[],
  ): TQuery<TQueryResult> {
    return (params: any) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      return this._createEntitiesByFieldsQuery(columns, params)
        .first()
        .then((result: TEntity) => (result ? (result[this._model.id] as TQueryResult) : null));
    };
  }

  /**
   * Creates an all query.
   * @returns query builder.
   */
  private _createAllEntitiesIdsQuery(): Knex.QueryBuilder {
    return this._knex.select(this._model.id).from(this._model.tableName);
  }

  /**
   * Creates a query by field value.
   * @param column Query column.
   * @param value Entity value.
   */
  private _createEntitiesByFieldMQuery(column: ApiSqlColumn, values: any[]): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery().whereIn(column.sqlName, values);
  }

  /**
   * Creates a query by field value.
   * @param column Query column.
   * @param value Entity value.
   */
  private _createEntitiesByFieldMQueryWithField(column: ApiSqlColumn, values: any[]): Knex.QueryBuilder {
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
  private _createEntitiesByFieldQuery(column: ApiSqlColumn, value: any): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery().where(column.sqlName, value);
  }

  /**
   * Creates an entities by fields query.
   *
   * @param columns columns to filter.
   * @param params Entity to filter.
   * @returns Entities by fields query.
   */
  private _createEntitiesByFieldsQuery(columns: ApiSqlColumn[], params: any): Knex.QueryBuilder {
    return columns.reduce(
      (previous, next) => previous.andWhere(next.sqlName, params[next.entityAlias]),
      this._createAllEntitiesIdsQuery(),
    );
  }

  /**
   * Process a config generation options.
   * @param options CfgGen options provided.
   * @param defaultQueryKeyGen Default query keyGen.
   * @param queryName Query name.
   * @returns Processed config generation options.
   */
  private _processCfgGenOptions(
    options: ApiCfgGenOptions<TEntity>,
    defaultQueryKeyGen: (params: any) => string,
    queryName: string,
  ): ApiCfgGenOptions<TEntity> {
    if (!options) {
      options = {};
    }
    if (!options.queryKeyGen) {
      options.queryKeyGen = defaultQueryKeyGen;
    }
    if (!options.entityKeyGen) {
      options.entityKeyGen = options.queryKeyGen;
    }
    if (!options.reverseHashKey) {
      options.reverseHashKey = this._model.keyGen.prefix + queryName + '/reverse';
    }
    return options;
  }
}
