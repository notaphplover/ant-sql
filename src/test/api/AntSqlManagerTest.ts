import { Test } from '@antjs/ant-js/src/testapi/api/test';
import { AntSqlManager } from '../../ant';
import { AntSqlModelManager } from '../../api/AntSqlModelManager';
import { AntSqlModel } from '../../model/AntSqlModel';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const modelTestGen = (prefix: string) =>
  new AntSqlModel(
    'id',
    { prefix: prefix },
    [
      {
        entityAlias: 'id',
        sqlName: 'id',
      },
    ],
    prefix.replace(/\//g, '_'),
  );

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
