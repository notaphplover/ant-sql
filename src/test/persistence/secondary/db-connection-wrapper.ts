import * as Knex from 'knex';
import { KnexDriver } from '../../../persistence/secondary/knex-driver';
import { DbTestConnection } from './db-test-connection';

const fakeConnection = Knex({
  client: KnexDriver.PG,
  connection: {
    database: 'fakedatabase',
    host: 'fake_host',
    password: 'fake_pw',
    user: 'fake_user',
  },
  version: '11.2',
});

const msSqlConnectionTestConfig: DbTestConnection = {
  connection: Knex({
    client: KnexDriver.MSSQL,
    connection: {
      database: process.env.MS_DB,
      host: 'ant_db_mssql',
      password: process.env.MS_SA_PASSWORD,
      user: process.env.MS_SA_USER,
    },
  }),
  dbCreationOptions: {
    connection: Knex({
      client: KnexDriver.MSSQL,
      connection: {
        host: 'ant_db_mssql',
        password: process.env.MS_SA_PASSWORD,
        user: process.env.MS_SA_USER,
      },
    }),
    name: process.env.MS_DB,
  },
};

const mySqlDbConnectionTestConfig: DbTestConnection = {
  connection: Knex({
    client: KnexDriver.MYSQL,
    connection: {
      database: process.env.MYSQL_DB,
      host: 'ant_db_mysql',
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
    },
    version: '8.0.16',
  }),
};

const mySql2DbConnectionTestConfig: DbTestConnection = {
  connection: Knex({
    client: KnexDriver.MYSQL2,
    connection: {
      database: process.env.MYSQL_2_DB,
      host: 'ant_db_mysql',
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
    },
    version: '8.0.16',
  }),
};

const postgreDbConnectionTestConfig: DbTestConnection = {
  connection: Knex({
    client: KnexDriver.PG,
    connection: {
      database: process.env.PG_DB,
      host: 'ant_db_postgres',
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
    },
    version: '11.2',
  }),
};

const sqliteDbConnectionTestConfig: DbTestConnection = {
  connection: Knex({
    client: KnexDriver.SQLITE3,
    connection: {
      filename: ':memory:',
    },
  }),
};

export class DBConnectionWrapper {
  /**
   * Fake connection.
   */
  protected _fakeConnection: Knex;
  /**
   * MS SQL DB connection
   */
  protected _msSqlDbConnectionConfig: DbTestConnection;
  /**
   * MySQL DB connection.
   */
  protected _mySqlDbConnectionConfig: DbTestConnection;
  /**
   * MySQL DB connection.
   */
  protected _mySql2DbConnectionConfig: DbTestConnection;
  /**
   * PostgreSQL DB connection.
   */
  protected _postgreDbConnectionConfig: DbTestConnection;
  /**
   * SQLite DB Connection.
   */
  protected _sqliteDbConnectionTestConfig: DbTestConnection;

  /**
   * Creates a new database connection wrapper.
   */
  public constructor() {
    this._fakeConnection = fakeConnection;
    this._msSqlDbConnectionConfig = msSqlConnectionTestConfig;
    this._mySqlDbConnectionConfig = mySqlDbConnectionTestConfig;
    this._mySql2DbConnectionConfig = mySql2DbConnectionTestConfig;
    this._postgreDbConnectionConfig = postgreDbConnectionTestConfig;
    this._sqliteDbConnectionTestConfig = sqliteDbConnectionTestConfig;
  }

  /**
   * Database connections.
   * @returns Database connections.
   */
  public get config(): DbTestConnection[] {
    return [
      this._msSqlDbConnectionConfig,
      this._mySqlDbConnectionConfig,
      this._mySql2DbConnectionConfig,
      this._postgreDbConnectionConfig,
      this._sqliteDbConnectionTestConfig,
    ];
  }

  /**
   * Gets a fake connection.
   */
  public get fakeConnection(): Knex {
    return this._fakeConnection;
  }

  /**
   * mssql test connection config
   */
  public get msConfig(): DbTestConnection {
    return this._msSqlDbConnectionConfig;
  }

  /**
   * mysql test connection config
   */
  public get mySqlConfig(): DbTestConnection {
    return this._mySqlDbConnectionConfig;
  }

  /**
   * mysql2 test connection config
   */
  public get mySql2Config(): DbTestConnection {
    return this._mySql2DbConnectionConfig;
  }

  /**
   * pg test connection config
   */
  public get pgConfig(): DbTestConnection {
    return this._postgreDbConnectionConfig;
  }

  /**
   * sqlite3 test connection config
   */
  public get sqliteConfig(): DbTestConnection {
    return this._sqliteDbConnectionTestConfig;
  }
}
