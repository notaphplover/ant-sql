import * as Bluebird from 'bluebird';
import * as Knex from 'knex';
import { DBConnectionWrapper } from './DBConnectionWrapper';

export class DBTestManager {
  /**
   * Database connection wrapper.
   */
  protected _dbConnection: DBConnectionWrapper;

  /**
   * Creates a new Database test manager.
   */
  public constructor() {
    this._dbConnection = new DBConnectionWrapper();
  }

  /**
   * Creates a new table in the database schema.
   * @param name Name of the new table.
   * @param primaryKeyColumn Primary key column.
   * @param otherColumns Other columns.
   * @returns Promise of table created.
   */
  public async createTable(
    name: string,
    primaryKeyColumn: { name: string, type: 'number' | 'string'},
    otherColumns: {[key: string]: 'number' | 'string' } = {},
  ): Promise<void> {
    const conn = this._dbConnection.dbConnection;
    const tableExists = await conn.schema.hasTable(name);
    if (tableExists) { throw new Error(`Table ${name} already exists.`); }
    await conn.schema.createTable(name, (table) => {
      const addColumn = (name: string, type: 'number' | 'string') => {
        if ('number' === type) {
          table.integer(name);
        } else if ('string' === type) {
          table.string(name);
        }
      };
      addColumn(primaryKeyColumn.name, primaryKeyColumn.type);
      for (const columnName in otherColumns) {
        if (otherColumns.hasOwnProperty(columnName)) {
          addColumn(columnName, otherColumns[columnName]);
        }
      }
      table.primary([primaryKeyColumn.name]);
    });
  }

  /**
   * Deletes all the tables from the schema.
   * @returns Promise of tables deleted.
   */
  public async deleteAllTables(): Promise<any> {
    const conn = this._dbConnection.dbConnection;
    const tables = await this._listTables(conn);
    return Promise.all(tables.map((table) => conn.schema.dropTable(table)));
  }

  /**
   * Inserts an entity in a table.
   * @param table table name.
   * @param entity Entity to insert.
   */
  public insert(table: string, entity: any): Promise<any> {
    const conn = this._dbConnection.dbConnection;
    return conn(table).insert(entity) as unknown as Promise<any>;
  }

  /**
   * Lists all tables of the database. Obtained from
   * https://github.com/tgriesser/knex/issues/360#issuecomment-406483016
   *
   * @param knex Knex instance.
   * @returns Tables found in the db schema.
   */
  protected _listTables(knex: Knex): Bluebird<string[]> {
    let query: string;
    let bindings: string[];

    switch (knex.client.driverName) {
      case 'mssql':
        // tslint:disable-next-line:max-line-length
        query = 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' AND table_catalog = ?',
        bindings = [ knex.client.database() ];
        break;
      case 'mysql':
      case 'mysql2':
        query = 'SELECT table_name FROM information_schema.tables WHERE table_schema = ?';
        bindings = [ knex.client.database() ];
        break;
      case 'oracle':
      case 'oracledb':
        query = 'SELECT table_name FROM user_tables';
        break;
      case 'pg':
        // tslint:disable-next-line:max-line-length
        query = 'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?';
        bindings = [ knex.client.database() ];
        break;
      case 'sqlite3':
        query = 'SELECT name AS table_name FROM sqlite_master WHERE type=\'table\'';
        break;
      default:
        throw new Error(`Driver "${ knex.client.driverName }" not supported`);
    }

    return knex.raw(query, bindings).then((results) => {
      return results.rows.map((row: any) => row.table_name);
    }).catch((err) => {
      throw err;
    });
  }
}
