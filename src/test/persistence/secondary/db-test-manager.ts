import * as Knex from 'knex';
import * as _ from 'lodash';
import { Entity } from '@antjs/ant-js';
import { KnexDriver } from '../../../persistence/secondary/knex-driver';
import { MSSqlSecondaryEntityManager } from '../../../persistence/secondary/mssql-secondary-entity-manager';
import { MySqlSecondaryEntityManager } from '../../../persistence/secondary/mysql-secondary-entity-manager';
import { SecondaryEntityManager } from '../../../persistence/secondary/secondary-entity-manager';
import { SqLiteSecondaryEntityManager } from '../../../persistence/secondary/sqlite-secondary-entity-manager';
import { SqlModel } from '../../../model/sql-model';
import { SqlSecondaryEntityManager } from '../../../persistence/secondary/sql-secondary-entity-manager';

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
    otherColumns: { [key: string]: 'boolean' | 'datetime' | 'number' | 'string' } = {},
  ): Promise<string> {
    const tableExists = await dbConnection.schema.hasTable(name);
    if (tableExists) {
      throw new Error(`Table ${name} already exists.`);
    }
    await dbConnection.schema.createTable(name, (table) => {
      const addColumn = (name: string, type: 'boolean' | 'datetime' | 'number' | 'string' | 'increments'): void => {
        if ('boolean' === type) {
          table.boolean(name);
        } else if ('datetime' === type) {
          if (
            KnexDriver.MYSQL === dbConnection.client.driverName ||
            KnexDriver.MYSQL2 === dbConnection.client.driverName
          ) {
            table.specificType(name, 'DATETIME(6)');
          } else if (KnexDriver.MSSQL === dbConnection.client.driverName) {
            // Not enought to ensure a right conversion... Thank you Micro$oft
            table.specificType(name, 'DATETIME2(7)');
          } else {
            table.dateTime(name);
          }
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
    return Promise.all(_.map(tables, (table) => dbConnection.schema.dropTable(table)));
  }

  /**
   * Inserts an entity in a table.
   * @param table table name.
   * @param entity Entity to insert.
   */
  public insert(dbConnection: Knex, table: string, entity: any): Promise<any> {
    return Promise.resolve(dbConnection(table).insert(entity));
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
    return Promise.resolve(knex.raw<any>(query));
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
      case KnexDriver.MSSQL:
        return (model, knex): SecondaryEntityManager<TEntity> => new MSSqlSecondaryEntityManager(model, knex);
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        return (model, knex): SecondaryEntityManager<TEntity> => new MySqlSecondaryEntityManager(model, knex);
      case KnexDriver.SQLITE3:
        return (model, knex): SecondaryEntityManager<TEntity> => new SqLiteSecondaryEntityManager(model, knex);
      default:
        return (model, knex): SecondaryEntityManager<TEntity> => new SqlSecondaryEntityManager(model, knex);
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
        knexQuery = Promise.resolve(
          knex('information_schema.tables')
            .select('table_name')
            .where('TABLE_TYPE', 'BASE TABLE')
            .andWhere('table_catalog', knex.client.database()),
        );
        break;
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        knexQuery = Promise.resolve(
          knex('information_schema.tables')
            .select('TABLE_NAME as table_name')
            .where('table_schema', knex.client.database()),
        );
        break;
      case KnexDriver.ORACLE:
      case KnexDriver.ORACLEDB:
        knexQuery = Promise.resolve(knex('user_tables').select('table_name'));
        break;
      case KnexDriver.PG:
        knexQuery = Promise.resolve(
          knex('information_schema.tables')
            .select('table_name')
            .where('table_schema', knex.raw('current_schema()'))
            .andWhere('table_catalog', knex.client.database()),
        );
        break;
      case KnexDriver.SQLITE3:
        knexQuery = Promise.resolve(
          knex('sqlite_master')
            .select('name as table_name')
            .where('type', 'table')
            .andWhereNot('table_name', 'like', 'sqlite_%'),
        );
        break;
      default:
        throw new Error(`Driver "${knex.client.driverName}" not supported`);
    }
    return knexQuery.then((results) => {
      return _.map(results, (row: any) => row.table_name);
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
        knexQuery = Promise.resolve(
          knex('information_schema.tables')
            .select('table_name')
            .where('table_schema', 'public')
            .limit(limitResultsSize),
        );
        break;
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        knexQuery = Promise.resolve(
          knex('information_schema.tables')
            .select('TABLE_NAME as table_name')
            .limit(limitResultsSize),
        );
        break;
      case KnexDriver.ORACLE:
      case KnexDriver.ORACLEDB:
        knexQuery = Promise.resolve(
          knex('user_tables')
            .select('table_name')
            .limit(limitResultsSize),
        );
        break;
      case KnexDriver.PG:
        knexQuery = Promise.resolve(
          knex('information_schema.tables')
            .select('table_name')
            .limit(limitResultsSize),
        );
        break;
      case KnexDriver.SQLITE3:
        knexQuery = Promise.resolve(
          knex('sqlite_master')
            .select('name as table_name')
            .limit(limitResultsSize),
        );
        break;
      default:
        throw new Error(`Driver "${knex.client.driverName}" not supported`);
    }
    return knexQuery;
  }
}
