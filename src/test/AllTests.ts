import { AntTest } from './AntTest';
import { AntSqlManagerTest } from './api/AntSqlManagerTest';
import { AntSqlModelManagerTest } from './api/AntSqlModelManagerTest';
import { DbServerAwaiter } from './await/DbServerAwaiter';
import { ITest } from './ITest';
import { AntSqlModelTest } from './model/AntSqlModelTest';
import { SqlModelManagerTest } from './primary/SqlModelManagerTest';
import { AntSqlSecondaryEntityManagerTest } from './secondary/AntSqlSecondaryEntityManagerTest';
import { DBConnectionWrapper } from './secondary/DBConnectionWrapper';
import { DBTestManager } from './secondary/DBTestManager';

const millisPerRequest = 1000;

export class AllTest implements ITest {
  public performTests(): void {
    new AntSqlManagerTest().performTests();
    new AntSqlModelTest().performTests();
    new AntTest().performTests();

    const dBConnectionWrapper = new DBConnectionWrapper();
    const dbServerAwaiter = new DbServerAwaiter(millisPerRequest);

    const fakeConnection = dBConnectionWrapper.fakeConnection;

    new AntSqlModelManagerTest(fakeConnection, 'fake').performTests();
    new SqlModelManagerTest(fakeConnection, 'fake').performTests();

    const testManager = new DBTestManager();

    for (const config of dBConnectionWrapper.config) {
      const connection = config.connection;
      let deleteAllTablesPromise =
        dbServerAwaiter
          .awaitServer(connection);

      if (config.dbToCreate) {
        deleteAllTablesPromise = deleteAllTablesPromise
            .then(() => testManager.createDatabaseIfNotExists(connection, config.dbToCreate))
            .then(() => testManager.useDatabase(connection, config.dbToCreate));
      }

      deleteAllTablesPromise = deleteAllTablesPromise
        .then(() => testManager.deleteAllTables(connection));

      new AntSqlSecondaryEntityManagerTest(
        deleteAllTablesPromise,
        connection,
        connection.client.driverName,
      ).performTests();
    }
  }
}
