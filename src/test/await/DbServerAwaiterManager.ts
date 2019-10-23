import { KnexDriver } from '../../persistence/secondary/KnexDriver';
import { DBConnectionWrapper } from '../persistence/secondary/DBConnectionWrapper';
import { DBTestManager } from '../persistence/secondary/DBTestManager';
import { IDbTestConnection } from '../persistence/secondary/IDbTestConnection';
import { DbServerAwaiter } from './DbServerAwaiter';

class DbServerAwaiterManager {
  /**
   * Db ready awaiters
   */
  protected _dbReadyAwaiters: Map<KnexDriver, Promise<any>>;
  /**
   * Db tables deleted awaiters.
   */
  protected _dbTablesDeletedAwaiters: Map<KnexDriver, Promise<any>>;
  /**
   * Db test manager
   */
  protected _dbTestManager: DBTestManager;

  /**
   * Creates a new DB server awaiter manager.
   */
  public constructor(millisPerRequest: number) {
    this._dbReadyAwaiters = new Map();
    this._dbTablesDeletedAwaiters = new Map();
    this._dbTestManager = new DBTestManager();

    this._initializeAwaiters(millisPerRequest);
  }

  /**
   * Gets an db ready awaiter for an specific driver.
   * @param driverName Driver name of the connection.
   */
  public getReadyAwaiter(driverName: KnexDriver): Promise<any> {
    return this._dbReadyAwaiters.get(driverName);
  }

  /**
   * Gets a tables deleted awaiter for an specific driver.
   * @param driverName Driver name of the connection.
   */
  public getTablesDeletedAwaiter(driverName: KnexDriver): Promise<any> {
    return this._dbTablesDeletedAwaiters.get(driverName);
  }

  /**
   * Creates a promise of DB ready for connections.
   * @param config Test database config.
   * @param dbServerAwaiter Server awaiter.
   * @param testManager Test manager.
   * @returns Promise of db ready for connections with the target database created.
   */
  private _createDBReadyPromise(
    config: IDbTestConnection,
    dbServerAwaiter: DbServerAwaiter,
    testManager: DBTestManager,
  ): Promise<any> {
    if (config.dbCreationOptions) {
      return dbServerAwaiter
        .awaitServer(config.dbCreationOptions.connection)
        .then(() =>
          testManager.createDatabaseIfNotExists(config.dbCreationOptions.connection, config.dbCreationOptions.name),
        );
    } else {
      const connection = config.connection;
      return dbServerAwaiter.awaitServer(connection);
    }
  }

  /**
   * Initializes the awaiters of the manager.
   * @param millisPerRequest Millis per request.
   */
  private _initializeAwaiters(millisPerRequest: number): void {
    const dbAwaiter = new DbServerAwaiter(millisPerRequest);
    const dbConnectionWrapper = new DBConnectionWrapper();
    const dbTestManager = new DBTestManager();
    for (const config of dbConnectionWrapper.config) {
      const connection = config.connection;
      const dbReadyPromise = this._createDBReadyPromise(config, dbAwaiter, dbTestManager);
      this._dbReadyAwaiters.set(connection.client.driverName, dbReadyPromise);

      const dbTablesDeletedAwaiter = dbReadyPromise.then(() => this._dbTestManager.deleteAllTables(connection));
      this._dbTablesDeletedAwaiters.set(connection.client.driverName, dbTablesDeletedAwaiter);
    }
  }
}
const millisPerRequest = 1000;
export const dbServerAwaiterManager = new DbServerAwaiterManager(millisPerRequest);
