import * as Knex from 'knex';

export interface DbTestConnection {
  /**
   * Knex connection.
   */
  connection: Knex;
  /**
   * True if the database must be created.
   */
  dbCreationOptions?: { connection: Knex; name: string };
}
