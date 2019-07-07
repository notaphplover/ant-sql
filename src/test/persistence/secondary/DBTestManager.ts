import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import * as Bluebird from 'bluebird';
import * as Knex from 'knex';
import { IAntSqlModel } from '../../../model/IAntSqlModel';
import { AntMySqlSecondaryEntityManager } from '../../../persistence/secondary/AntMySqlSecondaryEntityManager';
import { AntSQLiteSecondaryEntityManager } from '../../../persistence/secondary/AntSQLiteSecondaryEntityManager';
import { AntSqlSecondaryEntityManager } from '../../../persistence/secondary/AntSqlSecondaryEntityManager';
import { ISqlSecondaryEntityManager } from '../../../persistence/secondary/ISqlSecondaryEntityManager';
import { KnexDriver } from '../../../persistence/secondary/KnexDriver';

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
    primaryKeyColumn: { name: string, type: 'number' | 'string' | 'increments' },
    otherColumns: {[key: string]: 'number' | 'string' } = {},
  ): Promise<string> {
    const tableExists = await dbConnection.schema.hasTable(name);
    if (tableExists) { throw new Error(`Table ${name} already exists.`); }
    await dbConnection.schema.createTable(name, (table) => {
      const addColumn = (name: string, type: 'number' | 'string' | 'increments') => {
        if ('number' === type) {
          table.integer(name);
        } else if ('string' === type) {
          table.string(name);
        } else if ( 'increments' === type) {
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
    return dbConnection(table).insert(entity) as unknown as Promise<any>;
  }

  /**
   * Creates a database if no database with the same name exists.
   * @param knex Knex connection.
   * @param dbName DB Name.
   */
  public createDatabaseIfNotExists(
    knex: Knex,
    dbName: string,
  ): Promise<any> {
    let query: string;
    switch (knex.client.driverName) {
      case KnexDriver.MSSQL:
        query =
`IF  NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'${dbName}')
BEGIN
    CREATE DATABASE [${dbName}]
END`;
        break;
      default:
        throw new Error(`Driver "${ knex.client.driverName }" not supported`);
    }
    return knex.raw<any>(query);
  }

  /**
   * Gets the secondary entity manager generator for a DB connection.
   * @param knex Knex instance.
   * @returns Secondary entity manager generator.
   */
  public getSecondaryEntityManagerGenerator<TEntity extends IEntity>(knex: Knex)
    : (model: IAntSqlModel, knex: Knex) => ISqlSecondaryEntityManager<TEntity> {
    switch (knex.client.driverName) {
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        return (model, knex) => new AntMySqlSecondaryEntityManager(model, knex);
      case KnexDriver.SQLITE3:
        return (model, knex) => new AntSQLiteSecondaryEntityManager(model, knex);
      default:
        return (model, knex) => new AntSqlSecondaryEntityManager(model, knex);
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
          .andWhere('table_catalog', knex.client.database());
        break;
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        knexQuery = knex('information_schema.tables')
          .select('TABLE_NAME as table_name')
          .where('table_schema', knex.client.database());
        break;
      case KnexDriver.ORACLE:
      case KnexDriver.ORACLEDB:
        knexQuery = knex('user_tables')
          .select('table_name');
        break;
      case KnexDriver.PG:
        knexQuery = knex('information_schema.tables')
          .select('table_name')
          .where('table_schema', knex.raw('current_schema()'))
          .andWhere('table_catalog', knex.client.database());
        break;
      case KnexDriver.SQLITE3:
        knexQuery = knex('sqlite_master')
          .select('name as table_name')
          .where('type', 'table')
          .andWhereNot('table_name', 'like', 'sqlite_%');
        break;
      default:
        throw new Error(`Driver "${ knex.client.driverName }" not supported`);
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
          .limit(limitResultsSize);
        break;
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        knexQuery = knex('information_schema.tables')
          .select('TABLE_NAME as table_name')
          .limit(limitResultsSize);
        break;
      case KnexDriver.ORACLE:
      case KnexDriver.ORACLEDB:
        knexQuery = knex('user_tables')
          .select('table_name')
          .limit(limitResultsSize);
        break;
      case KnexDriver.PG:
        knexQuery = knex('information_schema.tables')
          .select('table_name')
          .limit(limitResultsSize);
        break;
      case KnexDriver.SQLITE3:
        knexQuery = knex('sqlite_master')
          .select('name as table_name')
          .limit(limitResultsSize);
        break;
      default:
        throw new Error(`Driver "${ knex.client.driverName }" not supported`);
    }
    return knexQuery;
  }
}
