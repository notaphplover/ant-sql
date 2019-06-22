import { AntTest } from './AntTest';
import { AntSqlManagerTest } from './api/AntSqlManagerTest';
import { AntSqlModelManagerTest } from './api/AntSqlModelManagerTest';
import { dbServerAwaiterManager } from './await/DbServerAwaiterManager';
import { ITest } from './ITest';
import { AntSqlModelTest } from './model/AntSqlModelTest';
import { SqlModelManagerTest } from './persistence/primary/SqlModelManagerTest';
import { AntSqlSecondaryEntityManagerTest } from './persistence/secondary/AntSqlSecondaryEntityManagerTest';
import { DBConnectionWrapper } from './persistence/secondary/DBConnectionWrapper';
import { DBTestManager } from './persistence/secondary/DBTestManager';
import { SecondaryEntityManagerHelperTest } from './persistence/secondary/SecondaryEntityManagerHelperTest';

export class AllTest implements ITest {

  /**
   * DB Test manager.
   */
  protected _testManager: DBTestManager;

  public constructor() {
    this._testManager = new DBTestManager();
  }

  public performTests(): void {
    new AntSqlManagerTest().performTests();
    new AntSqlModelTest().performTests();
    new AntTest().performTests();

    new SecondaryEntityManagerHelperTest().performTests();

    const dBConnectionWrapper = new DBConnectionWrapper();

    const fakeConnection = dBConnectionWrapper.fakeConnection;
    new SqlModelManagerTest(fakeConnection, 'fake').performTests();

    for (const config of dBConnectionWrapper.config) {
      const connection = config.connection;
      const deleteAllTablesPromise = dbServerAwaiterManager.getTablesDeletedAwaiter(
        connection.client.driverName,
      );

      new AntSqlModelManagerTest(
        connection,
        connection.client.driverName,
      ).performTests();

      new AntSqlSecondaryEntityManagerTest(
        deleteAllTablesPromise,
        connection,
        connection.client.driverName,
        this._testManager.getSecondaryEntityManagerGenerator(config.connection),
      ).performTests();
    }
  }
}
