import * as Knex from 'knex';
import { DBTestManager } from '../secondary/DBTestManager';

export class DbServerAwaiter {

  protected _dbTestManager: DBTestManager;

  protected _millisPerRequest: number;

  public constructor(millisPerRequest: number) {
    this._dbTestManager = new DBTestManager();
    this._millisPerRequest = millisPerRequest;
  }

  public awaitServer(connection: Knex): Promise<any> {
    const innerAwait = (connection: Knex, resolve: (value?: unknown) => void) => {
      this._dbTestManager.ping(connection)
        .then(resolve)
        .catch(() => {
          setTimeout(() => { innerAwait(connection, resolve); }, this._millisPerRequest);
        });
    };
    return new Promise((resolve) => {
      innerAwait(connection, resolve);
    });
  }
}
