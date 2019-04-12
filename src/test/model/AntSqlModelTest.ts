import { AntSqlModel } from '../../model/AntSqlModel';
import { ITest } from '../ITest';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

export class AntSqlModelTest implements ITest {

  /**
   * Declare name for the test
   */
  protected _declareName: string;

  public constructor() {
    this._declareName = 'AntSqlModelTest';
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustBeInitializable();
      this._itMustGetInitialValues();
    });
  }

  private _itMustBeInitializable(): void {
    const itsName = 'mustBeInitializable';
    it(itsName, async (done) => {
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new AntSqlModel(
          'id',
          { prefix: 'somePrefix', suffix: 'someSuffix'},
          'ModelSqlTableName',
        );
      }).not.toThrowError();
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustGetInitialValues(): void {
    const itsName = 'mustGetInitialValues';
    it(itsName, async (done) => {
      const tableName = 'ModelSqlTableName';
      const model = new AntSqlModel(
        'id',
        { prefix: 'somePrefix', suffix: 'someSuffix'},
        tableName,
      );
      expect(model.tableName).toBe(tableName);
      done();
    }, MAX_SAFE_TIMEOUT);
  }
}
