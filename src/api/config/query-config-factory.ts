import * as Knex from 'knex';
import { ApiQueryConfig, Entity } from '@antjs/ant-js';
import {
  MultipleQueryResult,
  SingleQueryResult,
  TQuery,
} from '@antjs/ant-js/build/persistence/primary/query/ant-primary-query-manager';
import { ApiCfgGenOptions } from './api-config-generation-options';
import { SqlColumn } from '../../model/sql-column';
import { SqlModel } from '../../model/sql-model';
import { SqlType } from '../../model/sql-type';

export class QueryConfigFactory<TEntity extends Entity> {
  /**
   * Knex connection.
   */
  protected _knex: Knex;
  /**
   * Model to manage.
   */
  protected _model: SqlModel<TEntity>;

  /**
   * Creates a query config factory.
   * @param knex Knex connection.
   * @param model Queries model.
   */
  public constructor(knex: Knex, model: SqlModel<TEntity>) {
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
    const keyGen = (): string => this._model.keyGen.prefix + queryAlias;
    options = this._processCfgGenOptions(options, queryAlias, keyGen, keyGen);

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
    column: SqlColumn,
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    const queryAlias = 'f_' + column.entityAlias + '/';
    const keyGen = (params: any): string => this._model.keyGen.prefix + queryAlias + params[column.entityAlias];
    options = this._processCfgGenOptions(options, queryAlias, keyGen, keyGen);
    return {
      entityKeyGen: options.entityKeyGen,
      isMultiple: true,
      mQuery: this._buildIdsByFieldMQuery<TQueryResult>(column),
      query: this._buildIdsByFieldQuery<TQueryResult>(column),
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
  public byFields<TQueryResult extends MultipleQueryResult>(
    columns: SqlColumn[],
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    const separator = '/';
    const queryAlias = 'mf_' + columns.reduce((previous, next) => previous + separator + next.entityAlias, '');
    const keyGen = (params: any): string =>
      columns.reduce((previous, next) => previous + params[next.entityAlias], this._model.keyGen.prefix + queryAlias);
    options = this._processCfgGenOptions(options, queryAlias, keyGen, keyGen);
    return {
      entityKeyGen: options.entityKeyGen,
      isMultiple: true,
      query: this._buildIdsByFieldsQuery<TQueryResult>(columns),
      queryKeyGen: options.queryKeyGen,
      reverseHashKey: options.reverseHashKey,
    };
  }

  /**
   * Creates a query of entities with a field value in a certain range.
   * @param column Column used as search discriminator.
   * @param rangeOptions Range options
   * @param options Query options
   * @returns Created query.
   */
  public byNumericRange<TQueryResult extends MultipleQueryResult>(
    column: SqlColumn,
    rangeOptions: {
      blockSize: number;
      minValueField: string;
    },
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    if (column.type !== SqlType.Integer) {
      throw new Error('A numeric column is expected!');
    }
    const queryAlias = 'r_' + column.entityAlias + '/';
    const entityKeyGen = (params: any): string =>
      this._model.keyGen.prefix + queryAlias + Math.floor(params[column.entityAlias] / rangeOptions.blockSize);
    const queryKeyGen = (params: any): string =>
      this._model.keyGen.prefix + queryAlias + params[rangeOptions.minValueField] / rangeOptions.blockSize;
    options = this._processCfgGenOptions(options, queryAlias, entityKeyGen, queryKeyGen);
    return {
      entityKeyGen: options.entityKeyGen,
      isMultiple: true,
      query: this._buildIdsByNumericRangeQuery<TQueryResult>(
        rangeOptions.blockSize,
        column,
        rangeOptions.minValueField,
      ),
      queryKeyGen: options.queryKeyGen,
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
    column: SqlColumn,
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    const queryAlias = 'uf_' + column.entityAlias + '/';
    const keyGen = (params: any): string => this._model.keyGen.prefix + queryAlias + params[column.entityAlias];
    options = this._processCfgGenOptions(options, queryAlias, keyGen, keyGen);
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
    columns: SqlColumn[],
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    const separator = '/';
    const queryAlias = 'umf_' + columns.reduce((previous, next) => previous + separator + next.entityAlias, '');
    const keyGen = (params: any): string =>
      columns.reduce((previous, next) => previous + params[next.entityAlias], this._model.keyGen.prefix + queryAlias);
    options = this._processCfgGenOptions(options, queryAlias, keyGen, keyGen);

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
    return (): Promise<TQueryResult> => {
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
  private _buildIdsByFieldMQuery<TQueryResult extends MultipleQueryResult>(column: SqlColumn): TQuery<TQueryResult[]> {
    return (params: any[]): Promise<TQueryResult[]> => {
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
    column: SqlColumn,
    valuesMap: Map<any, number[]>,
    valuesLength: number,
  ): (results: TEntity[]) => TQueryResult[] {
    return (results: TEntity[]): TQueryResult[] => {
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
  private _buildIdsByFieldQuery<TQueryResult extends MultipleQueryResult>(column: SqlColumn): TQuery<TQueryResult> {
    return (params: any): Promise<TQueryResult> => {
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
  private _buildIdsByFieldsQuery<TQueryResult extends MultipleQueryResult>(columns: SqlColumn[]): TQuery<TQueryResult> {
    return (params: any): Promise<TQueryResult> => {
      if (!params) {
        throw new Error('Expected params!');
      }
      return this._createEntitiesByFieldsQuery(columns, params).then(
        (results: TEntity[]) => results.map((result) => result[this._model.id]) as TQueryResult,
      );
    };
  }

  /**
   * Creates a query of entities by a range of values.
   * @param blockSize Block size of the ranges.
   * @param column Column used as search discriminator.
   * @param minValueField Minimun value field alias.
   * @returns Query generated.
   */
  private _buildIdsByNumericRangeQuery<TQueryResult extends MultipleQueryResult>(
    blockSize: number,
    column: SqlColumn,
    minValueField: string,
  ): TQuery<TQueryResult> {
    return (params: any): Promise<TQueryResult> => {
      if (!params || null == params[minValueField]) {
        throw new Error('Expected params!');
      }
      return this._createEntitiesByRangeQuery(blockSize, column, minValueField, params).then(
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
    column: SqlColumn,
  ): TQuery<TQueryResult[]> {
    return (params: any): Promise<TQueryResult[]> => {
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
  private _buildIdsByUniqueFieldQuery<TQueryResult extends SingleQueryResult>(column: SqlColumn): TQuery<TQueryResult> {
    return (params: any): Promise<TQueryResult> => {
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
    columns: SqlColumn[],
  ): TQuery<TQueryResult> {
    return (params: any): Promise<TQueryResult> => {
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
  private _createEntitiesByFieldMQuery(column: SqlColumn, values: any[]): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery().whereIn(column.sqlName, values);
  }

  /**
   * Creates a query by field value.
   * @param column Query column.
   * @param value Entity value.
   */
  private _createEntitiesByFieldMQueryWithField(column: SqlColumn, values: any[]): Knex.QueryBuilder {
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
  private _createEntitiesByFieldQuery(column: SqlColumn, value: any): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery().where(column.sqlName, value);
  }

  /**
   * Creates an entities by fields query.
   *
   * @param columns columns to filter.
   * @param params Entity to filter.
   * @returns Entities by fields query.
   */
  private _createEntitiesByFieldsQuery(columns: SqlColumn[], params: any): Knex.QueryBuilder {
    return columns.reduce(
      (previous, next) => previous.andWhere(next.sqlName, params[next.entityAlias]),
      this._createAllEntitiesIdsQuery(),
    );
  }

  /**
   * Creates a query of entities by a range of values.
   * @param blockSize Block size of the ranges.
   * @param column Column used as search discriminator.
   * @param minValueField Minimun value field alias.
   * @param params Search parameters
   * @returns Query generated.
   */
  private _createEntitiesByRangeQuery(
    blockSize: number,
    column: SqlColumn,
    minValueField: string,
    params: any,
  ): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery()
      .andWhere(column.sqlName, '>=', params[minValueField])
      .andWhere(column.sqlName, '<', params[minValueField] + blockSize);
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
    queryName: string,
    defaultEntityKeyGen: (params: any) => string,
    defaultQueryKeyGen: (params: any) => string,
  ): ApiCfgGenOptions<TEntity> {
    if (!options) {
      options = {};
    }
    if (!options.queryKeyGen) {
      options.queryKeyGen = defaultQueryKeyGen;
    }
    if (!options.entityKeyGen) {
      options.entityKeyGen = defaultEntityKeyGen;
    }
    if (!options.reverseHashKey) {
      options.reverseHashKey = this._model.keyGen.prefix + queryName + '/reverse';
    }
    return options;
  }
}
