import * as Bluebird from 'bluebird';
import * as Knex from 'knex';

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
  ): Bluebird<any> {
    let query: string;
    switch (knex.client.driverName) {
      case 'mssql':
        query =
`IF  NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'${dbName}')
BEGIN
    CREATE DATABASE [${dbName}]
END`;
        break;
      default:
        throw new Error(`Driver "${ knex.client.driverName }" not supported`);
    }
    return knex.raw(query);
  }

  /**
   * Lists all tables of the database. Obtained from
   * https://github.com/tgriesser/knex/issues/360#issuecomment-406483016
   *
   * @param knex Knex instance.
   * @returns Tables found in the db schema.
   */
  public listTables(knex: Knex): Bluebird<string[]> {
    let knexQuery: Bluebird<any[]>;
    switch (knex.client.driverName) {
      case 'mssql':
        knexQuery = knex('information_schema.tables')
          .select('table_name')
          .where('TABLE_TYPE', 'BASE TABLE')
          .andWhere('table_catalog', knex.client.database());
        break;
      case 'mysql':
      case 'mysql2':
        knexQuery = knex('information_schema.tables')
          .select('TABLE_NAME as table_name')
          .where('table_schema', knex.client.database());
        break;
      case 'oracle':
      case 'oracledb':
        knexQuery = knex('user_tables')
          .select('table_name');
        break;
      case 'pg':
        knexQuery = knex('information_schema.tables')
          .select('table_name')
          .where('table_schema', knex.raw('current_schema()'))
          .andWhere('table_catalog', knex.client.database());
        break;
      case 'sqlite3':
        knexQuery = knex('sqlite_master')
          .select('name as table_name')
          .where('type', 'table');
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
  public ping(knex: Knex): Bluebird<any> {
    let knexQuery: Bluebird<any>;
    const limitResultsSize = 1;
    switch (knex.client.driverName) {
      case 'mssql':
        knexQuery = knex('information_schema.tables')
          .select('table_name')
          .where('table_schema', 'public')
          .limit(limitResultsSize);
        break;
      case 'mysql':
      case 'mysql2':
        knexQuery = knex('information_schema.tables')
          .select('TABLE_NAME as table_name')
          .limit(limitResultsSize);
        break;
      case 'oracle':
      case 'oracledb':
        knexQuery = knex('user_tables')
          .select('table_name')
          .limit(limitResultsSize);
        break;
      case 'pg':
        knexQuery = knex('information_schema.tables')
          .select('table_name')
          .limit(limitResultsSize);
        break;
      case 'sqlite3':
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
