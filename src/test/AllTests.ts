import { Test } from '@antjs/ant-js/src/testapi/api/test';
import { AntTest } from './AntTest';
import { AntSqlManagerTest } from './api/AntSqlManagerTest';
import { AntSqlModelManagerTest } from './api/AntSqlModelManagerTest';
import { QueryConfigFactoryTest } from './api/QueryConfigFactoryTest';
import { dbServerAwaiterManager } from './await/DbServerAwaiterManager';
import { AntSqlModelTest } from './model/AntSqlModelTest';
import { RedisWrapper } from './persistence/primary/RedisWrapper';
import { SqlModelManagerTest } from './persistence/primary/SqlModelManagerTest';
import { AntSqlSecondaryEntityManagerTest } from './persistence/secondary/AntSqlSecondaryEntityManagerTest';
import { DBConnectionWrapper } from './persistence/secondary/DBConnectionWrapper';
import { DBTestManager } from './persistence/secondary/DBTestManager';
import { SecondaryEntityManagerHelperTest } from './persistence/secondary/SecondaryEntityManagerHelperTest';

export class AllTest implements Test {

  /**
   * DB Test manager.
   */
  protected _testManager: DBTestManager;

  public constructor() {
    this._testManager = new DBTestManager();
  }

  public performTests(): void {
    const redisWrapper = new RedisWrapper();
    const redis = redisWrapper.redis;
    const flushRedisPromise: Promise<any> = redis
      .flushall()
      .then(
        () => redis.script(['flush']),
      );

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

      const deleteAllTablesAndFlushRedisPromise = Promise.all([
        flushRedisPromise,
        deleteAllTablesPromise,
      ]);

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

      new QueryConfigFactoryTest(
        deleteAllTablesAndFlushRedisPromise,
        connection,
        connection.client.driverName,
      ).performTests();
    }
  }
}
