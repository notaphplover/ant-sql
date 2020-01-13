import { ApiQueryConfig, Entity } from '@antjs/ant-js';
import { MultipleQueryResult, TQuery } from '@antjs/ant-js/build/persistence/primary/query/ant-primary-query-manager';
import { ApiCfgGenOptions } from '../api-config-generation-options';
import { QueryConfigModule } from './query-config-module';

export class QueryAllConfigModule<TEntity extends Entity> extends QueryConfigModule<TEntity> {
  /**
   * Creates a query of all entities of a certain model.
   * @param options Config generation options
   * @returns Query config.
   */
  public buildCfg<TQueryResult extends MultipleQueryResult>(
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
}
