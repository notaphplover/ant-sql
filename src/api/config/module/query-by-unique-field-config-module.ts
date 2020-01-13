import * as _ from 'lodash';
import { ApiQueryConfig, Entity } from '@antjs/ant-js';
import { SingleQueryResult, TQuery } from '@antjs/ant-js/build/persistence/primary/query/query-types';
import { ApiCfgGenOptions } from '../api-config-generation-options';
import { QueryByFieldConfigModuleBase } from './query-by-field-config-module-base';
import { SqlColumn } from '../../../model/sql-column';

export class QueryByUniqueFieldConfigModule<TEntity extends Entity> extends QueryByFieldConfigModuleBase<TEntity> {
  /**
   * Creates a query of entities by a single field.
   * @param column Query column.
   * @param options Config generation options
   * @returns Query config.
   */
  public buildCfg<TQueryResult extends SingleQueryResult>(
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
   * Creates an ids by unique field query.
   * @param column AntSql column.
   * @returns query built.
   */
  private _buildIdsByUniqueFieldMQuery<TQueryResult extends SingleQueryResult>(
    column: SqlColumn,
  ): TQuery<TQueryResult[]> {
    return (params: any[]): Promise<TQueryResult[]> => {
      if (!params) {
        throw new Error('Expected params!');
      }
      if (0 === params.length) {
        return new Promise<TQueryResult[]>((resolve) => {
          resolve(new Array());
        });
      }
      const valuesArray = _.map(params, (params: any) => params[column.entityAlias]);
      const valuesMap = this._buildIdsByFieldMQueryBuildValuesMap(valuesArray);
      return this._createEntitiesByFieldMQueryWithField(column, valuesArray).then(
        this._buildIdsByUniqueFieldMQueryBuildPromiseCallback<TQueryResult>(column, valuesMap, valuesArray.length),
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
  private _buildIdsByUniqueFieldMQueryBuildPromiseCallback<TQueryResult extends SingleQueryResult>(
    column: SqlColumn,
    valuesMap: Map<any, number[]>,
    valuesLength: number,
  ): (results: TEntity[]) => TQueryResult[] {
    return (results: TEntity[]): TQueryResult[] => {
      const finalResults: TQueryResult[] = new Array(valuesLength);
      for (const result of results) {
        const id = result[this._model.id];
        const value = result[column.sqlName];
        const indexes = valuesMap.get(value);
        for (const index of indexes) {
          finalResults[index] = id;
        }
      }
      return finalResults;
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
}
