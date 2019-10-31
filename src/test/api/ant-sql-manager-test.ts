import { Test } from '@antjs/ant-js/build/testapi/api/test';
import { AntSqlManager } from '../../api/ant-sql-manager';
import { AntSqlModelManager } from '../../api/ant-sql-model-manager';
import { ApiSqlModel } from '../../api/api-sql-model';
import { SqlType } from '../../model/sql-type';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const modelTestGen = (prefix: string): ApiSqlModel => {
  return {
    columns: [
      {
        entityAlias: 'id',
        sqlName: 'id',
        type: SqlType.Integer,
      },
    ],
    id: 'id',
    keyGen: { prefix: prefix },
    tableName: prefix.replace(/\//g, '_'),
  };
};

export class AntSqlManagerTest implements Test {
  /**
   * Declare name for the test
   */
  protected _declareName: string;

  public constructor() {
    this._declareName = 'AntSqlManagerTest';
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustGenerateAnAntModelManager();
    });
  }

  private _itMustGenerateAnAntModelManager(): void {
    const itsName = 'mustGenerateAnAntModelManager';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        const model = modelTestGen(prefix);
        const manager = new AntSqlManager();
        const antModelManager = manager.get(model);
        expect(antModelManager instanceof AntSqlModelManager).toBe(true);
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }
}
