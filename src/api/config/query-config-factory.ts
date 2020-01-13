import * as Knex from 'knex';
import { ApiQueryConfig, Entity } from '@antjs/ant-js';
import { MultipleQueryResult, SingleQueryResult } from '@antjs/ant-js/build/persistence/primary/query/query-types';
import { ApiCfgGenOptions } from './api-config-generation-options';
import { QueryAllConfigModule } from './module/query-all-config-module';
import { QueryByFieldConfigModule } from './module/query-by-field-config-module';
import { QueryByFieldsConfigModule } from './module/query-by-fields-config-module';
import { QueryByNumericRangeConfigModule } from './module/query-by-numeric-range-config-module';
import { QueryByUniqueFieldConfigModule } from './module/query-by-unique-field-config-module';
import { QueryByUniqueFieldsConfigModule } from './module/query-by-unique-fields-config-module';
import { SqlColumn } from '../../model/sql-column';
import { SqlModel } from '../../model/sql-model';

export class QueryConfigFactory<TEntity extends Entity> {
  /**
   * All query config module
   */
  protected _queryAllConfigModule: QueryAllConfigModule<TEntity>;
  /**
   * Query by field config module.
   */
  protected _queryByFieldConfigModule: QueryByFieldConfigModule<TEntity>;
  /**
   * Query by fields config module.
   */
  protected _queryByFieldsConfigModule: QueryByFieldsConfigModule<TEntity>;
  /**
   * Query by numeric range config module.
   */
  protected _queryByNumericRangeConfigModule: QueryByNumericRangeConfigModule<TEntity>;
  /**
   * Query by unique field config module.
   */
  protected _queryByUniqueFieldConfigModule: QueryByUniqueFieldConfigModule<TEntity>;
  /**
   * Query by unique fields config module.
   */
  protected _queryByUniqueFieldsConfigModule: QueryByUniqueFieldsConfigModule<TEntity>;

  /**
   * Creates a query config factory.
   * @param knex Knex connection.
   * @param model Queries model.
   */
  public constructor(knex: Knex, model: SqlModel<TEntity>) {
    this._queryAllConfigModule = new QueryAllConfigModule(knex, model);
    this._queryByFieldConfigModule = new QueryByFieldConfigModule(knex, model);
    this._queryByFieldsConfigModule = new QueryByFieldsConfigModule(knex, model);
    this._queryByNumericRangeConfigModule = new QueryByNumericRangeConfigModule(knex, model);
    this._queryByUniqueFieldConfigModule = new QueryByUniqueFieldConfigModule(knex, model);
    this._queryByUniqueFieldsConfigModule = new QueryByUniqueFieldsConfigModule(knex, model);
  }

  /**
   * Creates a query of all entities of a certain model.
   * @param options Config generation options
   * @returns Query config.
   */
  public all<TQueryResult extends MultipleQueryResult>(
    options?: ApiCfgGenOptions<TEntity>,
  ): ApiQueryConfig<TEntity, TQueryResult> {
    return this._queryAllConfigModule.buildCfg(options);
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
    return this._queryByFieldConfigModule.buildCfg(column, options);
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
    return this._queryByFieldsConfigModule.buildCfg(columns, options);
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
    return this._queryByNumericRangeConfigModule.buildCfg(column, rangeOptions, options);
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
    return this._queryByUniqueFieldConfigModule.buildCfg(column, options);
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
    return this._queryByUniqueFieldsConfigModule.buildCfg(columns, options);
  }
}
