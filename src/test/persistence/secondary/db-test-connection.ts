import * as Knex from 'knex';

export interface DbTestConnection {
  /**
   * Knex connection.
   */
  readonly connection: Knex;
  /**
   * True if the database must be created.
   */
  readonly dbCreationOptions?: { connection: Knex; name: string };
}
