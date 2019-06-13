import * as Knex from 'knex';
import { IDbTestConnection } from './IDbTestConnection';

const fakeConnection = Knex({
  client: 'pg',
  connection: {
    database: 'fakedatabase',
    host: 'fake_host',
    password: 'fake_pw',
    user: 'fake_user',
  },
  version: '11.2',
});

const msSqlConnectionTestConfig: IDbTestConnection = {
  connection: Knex({
    client: 'mssql',
    connection: {
      database: process.env.MS_DB,
      host: 'ant_db_mssql',
      password: process.env.MS_SA_PASSWORD,
      user: process.env.MS_SA_USER,
    },
  }),
  dbCreationOptions: {
    connection: Knex({
      client: 'mssql',
      connection: {
        host: 'ant_db_mssql',
        password: process.env.MS_SA_PASSWORD,
        user: process.env.MS_SA_USER,
      },
    }),
    name: process.env.MS_DB,
  },
};

const mySqlDbConnectionTestConfig: IDbTestConnection = {
  connection: Knex({
    client: 'mysql',
    connection: {
      database: process.env.MYSQL_DB,
      host: 'ant_db_mysql',
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
    },
    version: '8.0.16',
  }),
};

const mySql2DbConnectionTestConfig: IDbTestConnection = {
  connection: Knex({
    client: 'mysql2',
    connection: {
      database: process.env.MYSQL_2_DB,
      host: 'ant_db_mysql',
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
    },
    version: '8.0.16',
  }),
};

const postgreDbConnectionTestConfig: IDbTestConnection = {
  connection: Knex({
    client: 'pg',
    connection: {
      database: process.env.PG_DB,
      host: 'ant_db_postgres',
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
    },
    version: '11.2',
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
  protected _msSqlDbConnectionConfig: IDbTestConnection;
  /**
   * MySQL DB connection.
   */
  protected _mysqlDbConnectionConfig: IDbTestConnection;
  /**
   * MySQL DB connection.
   */
  protected _mysql2DbConnectionConfig: IDbTestConnection;
  /**
   * PostgreSQL DB connection.
   */
  protected _postgreDbConnectionConfig: IDbTestConnection;

  /**
   * Creates a new database connection wrapper.
   */
  public constructor() {
    this._fakeConnection = fakeConnection;
    this._msSqlDbConnectionConfig = msSqlConnectionTestConfig;
    this._mysqlDbConnectionConfig = mySqlDbConnectionTestConfig;
    this._mysql2DbConnectionConfig = mySql2DbConnectionTestConfig;
    this._postgreDbConnectionConfig = postgreDbConnectionTestConfig;
  }

  /**
   * Database connections.
   * @returns Database connections.
   */
  public get config(): IDbTestConnection[] {
    return [
      this._msSqlDbConnectionConfig,
      this._mysqlDbConnectionConfig,
      this._mysql2DbConnectionConfig,
      this._postgreDbConnectionConfig,
    ];
  }

  /**
   * Gets a fake connection.
   */
  public get fakeConnection(): Knex {
    return this._fakeConnection;
  }
}
