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

export class QueryConfigFactory {

  /**
   * Creates a query of all entities of a certain model.
   * @param knex Knex instance.
   * @param model Query mode.
   * @param queryPrefix Query prefix used to generate Redis keys.
   * @returns Query config.
   */
  public getQueryAll<TEntity extends IEntity>(
    knex: Knex,
    model: IAntSqlModel,
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, MultipleQueryResult>;
  /**
   * Creates a query of all entities of a certain model.
   * @param knex Knex instance.
   * @param model Query mode.
   * @param queryPrefix Query prefix used to generate Redis keys.
   * @returns Query config.
   */
  public getQueryAll<
    TEntity extends IEntity,
    TQueryResult extends MultipleQueryResult,
  >(
    knex: Knex,
    model: IAntSqlModel,
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, TQueryResult> {
    return {
      isMultiple: true,
      query: this._buildAllIdsQuery<TEntity, TQueryResult>(
        knex, model,
      ),
      queryKeyGen: () => queryPrefix,
      reverseHashKey: queryPrefix + 'reverse',
    };
  }

  /**
   * Creates a query of entities by a single field.
   * @param knex Knex instance.
   * @param model Query model.
   * @param column Query column.
   * @param queryPrefix Query prefix.
   * @returns Query config.
   */
  public getQueryByField<TEntity extends IEntity>(
    knex: Knex,
    model: IAntSqlModel,
    column: IAntSQLColumn,
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, MultipleQueryResult>;
  /**
   * Creates a query of entities by a single field.
   * @param knex Knex instance.
   * @param model Query model.
   * @param column Query column.
   * @param queryPrefix Query prefix.
   * @returns Query config.
   */
  public getQueryByField<
    TEntity extends IEntity,
    TQueryResult extends MultipleQueryResult,
  >(
    knex: Knex,
    model: IAntSqlModel,
    column: IAntSQLColumn,
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, TQueryResult> {
    return {
      isMultiple: true,
      mQuery: this._buildIdsByFieldsQuery<TEntity, TQueryResult>(
        knex, model, column,
      ),
      query: this._buildIdsByFieldQuery<TEntity, TQueryResult>(
        knex, model, column,
      ),
      queryKeyGen: (params: any) => queryPrefix + params[column.entityAlias],
      reverseHashKey: queryPrefix + 'reverse',
    };
  }

  /**
   * Creates a query of entities by an unique field.
   * @param knex Knex instance.
   * @param model Query model.
   * @param column Query column.
   * @param queryPrefix Query prefix.
   * @returns Query config.
   */
  public getQueryByUniqueField<TEntity extends IEntity>(
    knex: Knex,
    model: IAntSqlModel,
    column: IAntSQLColumn,
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, SingleQueryResult>;
  /**
   * Creates a query of entities by an unique field.
   * @param knex Knex instance.
   * @param model Query model.
   * @param column Query column.
   * @param queryPrefix Query prefix.
   * @returns Query config.
   */
  public getQueryByUniqueField<
    TEntity extends IEntity,
    TQueryResult extends SingleQueryResult,
  >(
    knex: Knex,
    model: IAntSqlModel,
    column: IAntSQLColumn,
    queryPrefix: string,
  ): IAntQueryConfig<TEntity, TQueryResult> {
    return {
      isMultiple: false,
      mQuery: this._buildIdsByUniqueFieldsQuery<TEntity, TQueryResult>(
        knex, model, column,
      ),
      query: this._buildIdsByUniqueFieldQuery<TEntity, TQueryResult>(
        knex, model, column,
      ),
      queryKeyGen: (params: any) => queryPrefix + params[column.entityAlias],
      reverseHashKey: queryPrefix + 'reverse',
    };
  }

  /**
   * Creates an all ids query.
   * @param knex Knex connection.
   * @param model AntSQL model.
   * @returns query built.
   */
  private _buildAllIdsQuery<
    TEntity extends IEntity,
    TQueryResult extends MultipleQueryResult,
  >(
    knex: Knex,
    model: IAntSqlModel,
  ): TQuery<TQueryResult> {
    return () => {
      return this._createAllEntitiesIdsQuery(knex, model)
        .then(
          (results: TEntity[]) => results.map((result) => result[model.id]) as TQueryResult,
        );
    };
  }

  /**
   * Creates an ids by field query.
   * @param knex Knex connection.
   * @param model AntSQL model.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByFieldQuery<
    TEntity extends IEntity,
    TQueryResult extends MultipleQueryResult,
  >(
    knex: Knex,
    model: IAntSqlModel,
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
      return this._createEntitiesByFieldQuery(knex, model, column, fieldValue)
        .then(
          (results: TEntity[]) => results.map((result) => result[model.id]) as TQueryResult,
        );
    };
  }

  /**
   * Creates an ids by fields query.
   * @param knex Knex connection.
   * @param model AntSQL model.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByFieldsQuery<
    TEntity extends IEntity,
    TQueryResult extends MultipleQueryResult,
  >(
    knex: Knex,
    model: IAntSqlModel,
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
      return this._createEntitiesByFieldMQueryWithField(knex, model, column, valuesArray)
        .then(
          this._buildIdsByFieldsQueryBuildPromiseCallback<TEntity, TQueryResult>(
            model, column, valuesMap, valuesArray.length,
          ),
        );
    };
  }
  /**
   * Creates a promise callback to handle the results query response.
   * @param model AntSqlModel.
   * @param column AntSql column.
   * @param valuesMap Values map.
   * @param valuesLength values length.
   * @returns promise callback to handle the results query response.
   */
  private _buildIdsByFieldsQueryBuildPromiseCallback<
    TEntity extends IEntity,
    TQueryResult extends MultipleQueryResult,
  >(
    model: IAntSqlModel,
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
        const id = result[model.id];
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
   * @param knex Knex connection.
   * @param model AntSQL model.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByUniqueFieldQuery<
    TEntity extends IEntity,
    TQueryResult extends SingleQueryResult,
  >(
    knex: Knex,
    model: IAntSqlModel,
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
      return this._createEntitiesByFieldQuery(knex, model, column, fieldValue)
        .first()
        .then(
          (result: TEntity) => result ? result[model.id] as TQueryResult : null,
        );
    };
  }

  /**
   * Creates an ids by unique field query.
   * @param knex Knex connection.
   * @param model AntSQL model.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByUniqueFieldsQuery<
    TEntity extends IEntity,
    TQueryResult extends SingleQueryResult,
  >(
    knex: Knex,
    model: IAntSqlModel,
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
      return this._createEntitiesByFieldMQuery(knex, model, column, valuesArray)
        .then(
          (results: TEntity[]) => results.map((result) => result[model.id]) as TQueryResult[],
        );
    };
  }

  /**
   * Creates an all query.
   * @param knex Knex instance.
   * @param model Query model.
   * @returns query builder.
   */
  private _createAllEntitiesIdsQuery(
    knex: Knex,
    model: IAntSqlModel,
  ): Knex.QueryBuilder {
    return knex
      .select(model.id)
      .from(model.tableName);
  }

  /**
   * Creates a query by field value.
   * @param knex Knex instance.
   * @param model Query model.
   * @param column Query column.
   * @param value Entity value.
   */
  private _createEntitiesByFieldMQuery(
    knex: Knex,
    model: IAntSqlModel,
    column: IAntSQLColumn,
    values: any[],
  ): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery(knex, model)
      .whereIn(column.sqlName, values);
  }

  /**
   * Creates a query by field value.
   * @param knex Knex instance.
   * @param model Query model.
   * @param column Query column.
   * @param value Entity value.
   */
  private _createEntitiesByFieldMQueryWithField(
    knex: Knex,
    model: IAntSqlModel,
    column: IAntSQLColumn,
    values: any[],
  ): Knex.QueryBuilder {
    return knex
      .select(model.id, column.sqlName)
      .from(model.tableName)
      .whereIn(column.sqlName, values);
  }

  /**
   * Creates a query by field value.
   * @param knex Knex instance.
   * @param model Query model.
   * @param column Query column.
   * @param value Entity value.
   */
  private _createEntitiesByFieldQuery(
    knex: Knex,
    model: IAntSqlModel,
    column: IAntSQLColumn,
    value: any,
  ): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery(knex, model)
      .where(column.sqlName, value);
  }
}
