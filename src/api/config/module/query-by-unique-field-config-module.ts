import * as Knex from 'knex';
import { ApiQueryConfig, Entity } from '@antjs/ant-js';
import { SingleQueryResult, TQuery } from '@antjs/ant-js/build/persistence/primary/query/ant-primary-query-manager';
import { ApiCfgGenOptions } from '../api-config-generation-options';
import { QueryConfigModule } from './query-config-module';
import { SqlColumn } from '../../../model/sql-column';

export class QueryByUniqueFieldConfigModule<TEntity extends Entity> extends QueryConfigModule<TEntity> {
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
   * Creates a query by field value.
   * @param column Query column.
   * @param value Entity value.
   */
  private _createEntitiesByFieldMQuery(column: SqlColumn, values: any[]): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery().whereIn(column.sqlName, values);
  }
}
