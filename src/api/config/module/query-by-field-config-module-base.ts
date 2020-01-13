import * as Knex from 'knex';
import { Entity } from '@antjs/ant-js';
import { QueryConfigModule } from './query-config-module';
import { SqlColumn } from '../../../model/sql-column';

export abstract class QueryByFieldConfigModuleBase<TEntity extends Entity> extends QueryConfigModule<TEntity> {

  /**
   * Builds a values-to-indexes map from a values array.
   * @param valuesArray Values array.
   */
  protected _buildIdsByFieldMQueryBuildValuesMap(valuesArray: any[]): Map<any, number[]> {
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
   * Creates a query by field value.
   * @param column Query column.
   * @param value Entity value.
   */
  protected _createEntitiesByFieldMQueryWithField(column: SqlColumn, values: any[]): Knex.QueryBuilder {
    return this._knex
      .select(this._model.id, column.sqlName)
      .from(this._model.tableName)
      .whereIn(column.sqlName, values);
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
}
