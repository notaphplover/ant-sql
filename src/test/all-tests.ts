import { AntSqlManagerTest } from './api/ant-sql-manager-test';
import { AntSqlModelManagerTest } from './api/ant-sql-model-manager-test';
import { AntSqlModelTest } from './model/ant-sql-model-test';
import { AntSqlReferenceTest } from './model/ref/ant-sql-reference-test';
import { AntTest } from './ant-test';
import { DBConnectionWrapper } from './persistence/secondary/db-connection-wrapper';
import { DBTestManager } from './persistence/secondary/db-test-manager';
import { QueryConfigFactoryTest } from './api/query-config-factory-test';
import { RedisWrapper } from './persistence/primary/redis-wrapper';
import { SecondaryEntityManagerHelperTest } from './persistence/secondary/secondary-entity-manager-helper-test';
import { SqlSecondaryEntityManagerTest } from './persistence/secondary/sql-secondary-entity-manager-test';
import { Test } from '@antjs/ant-js/build/testapi/api/test';
import { dbServerAwaiterManager } from './await/db-server-awaiter-manager';

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
    new AntSqlReferenceTest().performTests();
    new AntTest().performTests();

    new SecondaryEntityManagerHelperTest().performTests();

    const dBConnectionWrapper = new DBConnectionWrapper();

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
