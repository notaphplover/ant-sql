import * as Knex from 'knex';

/**
 * Connection to the test database.
 */
const dbConnectionTest = Knex({
  client: 'pg',
  connection: {
    database: 'antsqltest',
    host: 'ant_db',
    password: 'antpassword',
    user: 'antuser',
  },
  version: '11.2',
});

export class DBConnectionWrapper {
  /**
   * DB connection.
   */
  protected _dbConnection: Knex;

  /**
   * Creates a new database connection wrapper.
   */
  public constructor() {
    this._dbConnection = dbConnectionTest;
  }

  /**
   * Database connection.
   */
  public get dbConnection(): Knex {
    return this._dbConnection;
  }
}
