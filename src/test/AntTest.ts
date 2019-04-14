import * as AntJs from '../ant';
import { AntSqlManager } from '../api/AntSqlManager';
import { ITest } from './ITest';

export class AntTest implements ITest {

  public performTests() {
    describe('AntTest', () => {
      this._itMustExportTypes();
    });
  }

  private _itMustExportTypes(): void {
    it('mustExportTypes', () => {
      expect(AntJs.AntSqlManager).toBe(AntSqlManager);
    });
  }
}
