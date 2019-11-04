import { Entity } from '@antjs/ant-js';
import * as Knex from 'knex';
import { SqlModel } from '../../../model/sql-model';
import { KnexDriver } from '../../../persistence/secondary/knex-driver';
import { MySqlSecondaryEntityManager } from '../../../persistence/secondary/mysql-secondary-entity-manager';
import { SecondaryEntityManager } from '../../../persistence/secondary/secondary-entity-manager';
import { SqlSecondaryEntityManager } from '../../../persistence/secondary/sql-secondary-entity-manager';
import { SqLiteSecondaryEntityManager } from '../../../persistence/secondary/sqlite-secondary-entity-manager';

export class DBTestManager {
  /**
   * Creates a new table in the database schema.
   * @param name Name of the new table.
   * @param primaryKeyColumn Primary key column.
   * @param otherColumns Other columns.
   * @param increments True to establish an auto increment primary key.
   * @returns Promise of table created.
   */
  public async createTable(
    dbConnection: Knex,
    name: string,
    primaryKeyColumn: { name: string; type: 'number' | 'string' | 'increments' },
    otherColumns: { [key: string]: 'datetime' | 'number' | 'string' } = {},
  ): Promise<string> {
    const tableExists = await dbConnection.schema.hasTable(name);
    if (tableExists) {
      throw new Error(`Table ${name} already exists.`);
    }
    await dbConnection.schema.createTable(name, (table) => {
      const addColumn = (name: string, type: 'datetime' | 'number' | 'string' | 'increments') => {
        if ('datetime' === type) {
          table.dateTime(name);
        } else if ('number' === type) {
          table.integer(name);
        } else if ('string' === type) {
          table.string(name);
        } else if ('increments' === type) {
          table.increments(name);
        }
      };
      addColumn(primaryKeyColumn.name, primaryKeyColumn.type);
      for (const columnName in otherColumns) {
        if (otherColumns.hasOwnProperty(columnName)) {
          addColumn(columnName, otherColumns[columnName]);
        }
      }
    });
    return name;
  }

  /**
   * Deletes all the tables from the schema.
   * @returns Promise of tables deleted.
   */
  public async deleteAllTables(dbConnection: Knex): Promise<any> {
    const tables = await this.listTables(dbConnection);
    return Promise.all(tables.map((table) => dbConnection.schema.dropTable(table)));
  }

  /**
   * Inserts an entity in a table.
   * @param table table name.
   * @param entity Entity to insert.
   */
  public insert(dbConnection: Knex, table: string, entity: any): Promise<any> {
    return (dbConnection(table).insert(entity) as unknown) as Promise<any>;
  }

  /**
   * Creates a database if no database with the same name exists.
   * @param knex Knex connection.
   * @param dbName DB Name.
   */
  public createDatabaseIfNotExists(knex: Knex, dbName: string): Promise<any> {
    let query: string;
    switch (knex.client.driverName) {
      case KnexDriver.MSSQL:
        query = `IF  NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'${dbName}')
BEGIN
    CREATE DATABASE [${dbName}]
END`;
        break;
      default:
        throw new Error(`Driver "${knex.client.driverName}" not supported`);
    }
    return knex.raw<any>(query) as unknown as Promise<any>;
  }

  /**
   * Gets the secondary entity manager generator for a DB connection.
   * @param knex Knex instance.
   * @returns Secondary entity manager generator.
   */
  public getSecondaryEntityManagerGenerator<TEntity extends Entity>(
    knex: Knex,
  ): (model: SqlModel<TEntity>, knex: Knex) => SecondaryEntityManager<TEntity> {
    switch (knex.client.driverName) {
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        return (model, knex) => new MySqlSecondaryEntityManager(model, knex);
      case KnexDriver.SQLITE3:
        return (model, knex) => new SqLiteSecondaryEntityManager(model, knex);
      default:
        return (model, knex) => new SqlSecondaryEntityManager(model, knex);
    }
  }

  /**
   * Lists all tables of the database. Obtained from
   * https://github.com/tgriesser/knex/issues/360#issuecomment-406483016
   *
   * @param knex Knex instance.
   * @returns Tables found in the db schema.
   */
  public listTables(knex: Knex): Promise<string[]> {
    let knexQuery: Promise<any[]>;
    switch (knex.client.driverName) {
      case KnexDriver.MSSQL:
        knexQuery = knex('information_schema.tables')
          .select('table_name')
          .where('TABLE_TYPE', 'BASE TABLE')
          .andWhere('table_catalog', knex.client.database()) as unknown as Promise<any>;
        break;
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        knexQuery = knex('information_schema.tables')
          .select('TABLE_NAME as table_name')
          .where('table_schema', knex.client.database()) as unknown as Promise<any>;
        break;
      case KnexDriver.ORACLE:
      case KnexDriver.ORACLEDB:
        knexQuery = knex('user_tables').select('table_name') as unknown as Promise<any>;
        break;
      case KnexDriver.PG:
        knexQuery = knex('information_schema.tables')
          .select('table_name')
          .where('table_schema', knex.raw('current_schema()'))
          .andWhere('table_catalog', knex.client.database()) as unknown as Promise<any>;
        break;
      case KnexDriver.SQLITE3:
        knexQuery = knex('sqlite_master')
          .select('name as table_name')
          .where('type', 'table')
          .andWhereNot('table_name', 'like', 'sqlite_%') as unknown as Promise<any>;
        break;
      default:
        throw new Error(`Driver "${knex.client.driverName}" not supported`);
    }
    return knexQuery.then((results) => {
      return results.map((row: any) => row.table_name);
    });
  }

  /**
   * Pings the database using a sample query.
   * @param knex Knex connection.
   * @returns Promise of query executed.
   */
  public ping(knex: Knex): Promise<any> {
    let knexQuery: Promise<any>;
    const limitResultsSize = 1;
    switch (knex.client.driverName) {
      case KnexDriver.MSSQL:
        knexQuery = knex('information_schema.tables')
          .select('table_name')
          .where('table_schema', 'public')
          .limit(limitResultsSize) as unknown as Promise<any>;
        break;
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        knexQuery = knex('information_schema.tables')
          .select('TABLE_NAME as table_name')
          .limit(limitResultsSize) as unknown as Promise<any>;
        break;
      case KnexDriver.ORACLE:
      case KnexDriver.ORACLEDB:
        knexQuery = knex('user_tables')
          .select('table_name')
          .limit(limitResultsSize) as unknown as Promise<any>;
        break;
      case KnexDriver.PG:
        knexQuery = knex('information_schema.tables')
          .select('table_name')
          .limit(limitResultsSize) as unknown as Promise<any>;
        break;
      case KnexDriver.SQLITE3:
        knexQuery = knex('sqlite_master')
          .select('name as table_name')
          .limit(limitResultsSize) as unknown as Promise<any>;
        break;
      default:
        throw new Error(`Driver "${knex.client.driverName}" not supported`);
    }
    return knexQuery;
  }
}
