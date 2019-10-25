import { Test } from '@antjs/ant-js/build/testapi/api/test';
import { AntTest } from './ant-test';
import { AntSqlManagerTest } from './api/ant-sql-manager-test';
import { AntSqlModelManagerTest } from './api/ant-sql-model-manager-test';
import { QueryConfigFactoryTest } from './api/query-config-factory-test';
import { dbServerAwaiterManager } from './await/db-server-awaiter-manager';
import { AntSqlModelTest } from './model/ant-sql-model-test';
import { AntSqlPrimaryModelManagerTest } from './persistence/primary/ant-sql-primary-model-manager-test';
import { RedisWrapper } from './persistence/primary/redis-wrapper';
import { DBConnectionWrapper } from './persistence/secondary/db-connection-wrapper';
import { DBTestManager } from './persistence/secondary/db-test-manager';
import { SecondaryEntityManagerHelperTest } from './persistence/secondary/secondary-entity-manager-helper-test';
import { SqlSecondaryEntityManagerTest } from './persistence/secondary/sql-secondary-entity-manager-test';

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
    const flushRedisPromise: Promise<any> = redis.flushall().then(() => redis.script(['flush']));

    new AntSqlManagerTest().performTests();
    new AntSqlModelTest().performTests();
    new AntTest().performTests();

    new SecondaryEntityManagerHelperTest().performTests();

    const dBConnectionWrapper = new DBConnectionWrapper();

    const fakeConnection = dBConnectionWrapper.fakeConnection;
    new AntSqlPrimaryModelManagerTest(fakeConnection, 'fake').performTests();

    for (const config of dBConnectionWrapper.config) {
      const connection = config.connection;
      const deleteAllTablesPromise = dbServerAwaiterManager.getTablesDeletedAwaiter(connection.client.driverName);

      const deleteAllTablesAndFlushRedisPromise = Promise.all([flushRedisPromise, deleteAllTablesPromise]);

      new AntSqlModelManagerTest(connection, connection.client.driverName).performTests();

      new SqlSecondaryEntityManagerTest(
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
