import { ApiQueryConfig, Entity } from '@antjs/ant-js';
import { MultipleQueryResult, TQuery } from '@antjs/ant-js/build/persistence/primary/query/ant-primary-query-manager';
import { ApiCfgGenOptions } from '../api-config-generation-options';
import { QueryConfigModule } from './query-config-module';
import { SqlColumn } from '../../../model/sql-column';

export class QueryByFieldsConfigModule<TEntity extends Entity> extends QueryConfigModule<TEntity> {
  /**
   * Creates a query of entities by multiple fields.
   * @param columns columns to filter.
   * @param options config generation options.
   * @returns Query of entities by multiple fields.
   */
  public buildCfg<TQueryResult extends MultipleQueryResult>(
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
}
