import { ITest } from '@antjs/ant-js/src/testapi/api/ITest';
import * as AntJs from '../ant';
import { AntSqlManager } from '../api/AntSqlManager';

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
