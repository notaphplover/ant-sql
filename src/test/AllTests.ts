import { ITest } from './ITest';
import { AntSqlModelTest } from './model/AntSqlModelTest';
import { RedisWrapper } from './primary/RedisWrapper';
import { AntSqlSecondaryEntityManagerTest } from './secondary/AntSqlSecondaryEntityManagerTest';
import { DBTestManager } from './secondary/DBTestManager';

export class AllTest implements ITest {
  public performTests(): void {
    const flushRedisPromise: Promise<any> = new RedisWrapper().redis.flushall();
    const deleteAllTables = new DBTestManager().deleteAllTables();
    new AntSqlModelTest().performTests();
  }
}
