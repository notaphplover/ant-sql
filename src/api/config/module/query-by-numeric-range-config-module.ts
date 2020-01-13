import * as Knex from 'knex';
import * as _ from 'lodash';
import { ApiQueryConfig, Entity } from '@antjs/ant-js';
import { MultipleQueryResult, TQuery } from '@antjs/ant-js/build/persistence/primary/query/ant-primary-query-manager';
import { ApiCfgGenOptions } from '../api-config-generation-options';
import { QueryConfigModule } from './query-config-module';
import { SqlColumn } from '../../../model/sql-column';
import { SqlType } from '../../../model/sql-type';

export class QueryByNumericRangeConfigModule<TEntity extends Entity> extends QueryConfigModule<TEntity> {
  /**
   * Creates a query of entities with a field value in a certain range.
   * @param column Column used as search discriminator.
   * @param rangeOptions Range options
   * @param options Query options
   * @returns Created query.
   */
  public buildCfg<TQueryResult extends MultipleQueryResult>(
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
    const queryAlias = 'nr_' + column.entityAlias + '/';
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
        (results: TEntity[]) => _.map(results, (result) => result[this._model.id]) as TQueryResult,
      );
    };
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
}
