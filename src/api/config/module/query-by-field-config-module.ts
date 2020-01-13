import * as Knex from 'knex';
import { ApiQueryConfig, Entity } from '@antjs/ant-js';
import { MultipleQueryResult, TQuery } from '@antjs/ant-js/build/persistence/primary/query/ant-primary-query-manager';
import { ApiCfgGenOptions } from '../api-config-generation-options';
import { QueryConfigModule } from './query-config-module';
import { SqlColumn } from '../../../model/sql-column';

export class QueryByFieldConfigModule<TEntity extends Entity> extends QueryConfigModule<TEntity> {

  /**
   * Creates a query of entities by a single field.
   * @param column Query column.
   * @param options Config generation options
   * @returns Query config.
   */
  public buildCfg<TQueryResult extends MultipleQueryResult>(
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
      const finalResults: TQueryResult[] = new Array(valuesLength);
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
}
