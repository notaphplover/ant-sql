import * as Knex from 'knex';
import { DBTestManager } from '../persistence/secondary/db-test-manager';

export class DbServerAwaiter {
  protected _dbTestManager: DBTestManager;

  protected _millisPerRequest: number;

  public constructor(millisPerRequest: number) {
    this._dbTestManager = new DBTestManager();
    this._millisPerRequest = millisPerRequest;
  }

  /**
   * Awaits a db server until it's ready to handle connections.
   * @param connection Connection to the db server to await
   */
  public awaitServer(connection: Knex): Promise<any> {
    const innerAwait = (connection: Knex, resolve: (value?: unknown) => void) => {
      this._dbTestManager
        .ping(connection)
        .then(resolve)
        .catch(() => {
          setTimeout(() => {
            innerAwait(connection, resolve);
          }, this._millisPerRequest);
        });
    };
    return new Promise((resolve) => {
      innerAwait(connection, resolve);
    });
  }
}
