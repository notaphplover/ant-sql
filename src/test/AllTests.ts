import { AntTest } from './AntTest';
import { AntSqlManagerTest } from './api/AntSqlManagerTest';
import { AntSqlModelManagerTest } from './api/AntSqlModelManagerTest';
import { DbServerAwaiter } from './await/DbServerAwaiter';
import { ITest } from './ITest';
import { AntSqlModelTest } from './model/AntSqlModelTest';
import { SqlModelManagerTest } from './persistence/primary/SqlModelManagerTest';
import { AntSqlSecondaryEntityManagerTest } from './persistence/secondary/AntSqlSecondaryEntityManagerTest';
import { DBConnectionWrapper } from './persistence/secondary/DBConnectionWrapper';
import { DBTestManager } from './persistence/secondary/DBTestManager';
import { IDbTestConnection } from './persistence/secondary/IDbTestConnection';

const millisPerRequest = 1000;

export class AllTest implements ITest {
  public performTests(): void {
    new AntSqlManagerTest().performTests();
    new AntSqlModelTest().performTests();
    new AntTest().performTests();

    const dBConnectionWrapper = new DBConnectionWrapper();
    const dbServerAwaiter = new DbServerAwaiter(millisPerRequest);

    const fakeConnection = dBConnectionWrapper.fakeConnection;

    new SqlModelManagerTest(fakeConnection, 'fake').performTests();

    const testManager = new DBTestManager();

    for (const config of dBConnectionWrapper.config) {
      const connection = config.connection;
      const dbReadyPromise = this._createDBReadyPromise(config, dbServerAwaiter, testManager);
      const deleteAllTablesPromise = dbReadyPromise
        .then(() => testManager.deleteAllTables(connection));

      new AntSqlModelManagerTest(
        connection,
        connection.client.driverName,
      ).performTests();

      new AntSqlSecondaryEntityManagerTest(
        deleteAllTablesPromise,
        connection,
        connection.client.driverName,
        testManager.getSecondaryEntityManagerGenerator(config.connection),
      ).performTests();
    }
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
        .then(() => testManager.createDatabaseIfNotExists(
          config.dbCreationOptions.connection,
          config.dbCreationOptions.name,
        ));
    } else {
      const connection = config.connection;
      return dbServerAwaiter
        .awaitServer(connection);
    }
  }
}
