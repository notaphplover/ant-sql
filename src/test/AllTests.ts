import { AntSqlModelManagerTest } from './api/AntSqlModelManagerTest';
import { ITest } from './ITest';
import { AntSqlModelTest } from './model/AntSqlModelTest';
import { AntSqlSecondaryEntityManagerTest } from './secondary/AntSqlSecondaryEntityManagerTest';
import { DBTestManager } from './secondary/DBTestManager';

export class AllTest implements ITest {
  public performTests(): void {
    const deleteAllTables = new DBTestManager().deleteAllTables();
    new AntSqlModelManagerTest().performTests();
    new AntSqlModelTest().performTests();
    new AntSqlSecondaryEntityManagerTest(deleteAllTables).performTests();
  }
}
