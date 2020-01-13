import { ApiQueryConfig, Entity } from '@antjs/ant-js';
import { SingleQueryResult, TQuery } from '@antjs/ant-js/build/persistence/primary/query/query-types';
import { ApiCfgGenOptions } from '../api-config-generation-options';
import { QueryByFieldConfigModuleBase } from './query-by-field-config-module-base';
import { SqlColumn } from '../../../model/sql-column';

export class QueryByUniqueFieldsConfigModule<TEntity extends Entity> extends QueryByFieldConfigModuleBase<TEntity> {
  /**
   * Creates a query of entities by multiple fields.
   * @param columns columns to filter.
   * @param options config generation options.
   * @returns Query of entities by multiple fields.
   */
  public buildCfg<TQueryResult extends SingleQueryResult>(
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
}
