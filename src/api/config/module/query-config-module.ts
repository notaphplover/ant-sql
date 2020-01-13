import * as Knex from 'knex';
import { ApiCfgGenOptions } from '../api-config-generation-options';
import { Entity } from '@antjs/ant-js';
import { SqlColumn } from '../../../model/sql-column';
import { SqlModel } from '../../../model/sql-model';

export abstract class QueryConfigModule<TEntity extends Entity> {
  /**
   * Knex connection.
   */
  protected _knex: Knex;
  /**
   * Model to manage.
   */
  protected _model: SqlModel<TEntity>;

  /**
   * Creates a query config factory module.
   * @param knex Knex connection.
   * @param model Queries model.
   */
  public constructor(knex: Knex, model: SqlModel<TEntity>) {
    this._knex = knex;
    this._model = model;
  }

  /**
   * Creates an all query.
   * @returns query builder.
   */
  protected _createAllEntitiesIdsQuery(): Knex.QueryBuilder {
    return this._knex.select(this._model.id).from(this._model.tableName);
  }

  /**
   * Creates a query by field value.
   * @param column Query column.
   * @param value Entity value.
   */
  protected _createEntitiesByFieldQuery(column: SqlColumn, value: any): Knex.QueryBuilder {
    return this._createAllEntitiesIdsQuery().where(column.sqlName, value);
  }

  /**
   * Creates an entities by fields query.
   *
   * @param columns columns to filter.
   * @param params Entity to filter.
   * @returns Entities by fields query.
   */
  protected _createEntitiesByFieldsQuery(columns: SqlColumn[], params: any): Knex.QueryBuilder {
    return columns.reduce(
      (previous, next) => previous.andWhere(next.sqlName, params[next.entityAlias]),
      this._createAllEntitiesIdsQuery(),
    );
  }

  /**
   * Process a config generation options.
   * @param options CfgGen options provided.
   * @param defaultQueryKeyGen Default query keyGen.
   * @param queryName Query name.
   * @returns Processed config generation options.
   */
  protected _processCfgGenOptions(
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
