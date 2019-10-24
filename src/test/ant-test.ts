import { Test } from '@antjs/ant-js/src/testapi/api/test';
import * as AntJs from '../ant';
import { AntSqlManager } from '../api/ant-sql-manager';

export class AntTest implements Test {
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
