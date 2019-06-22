import { SecondaryEntityManagerHelper } from '../../../persistence/secondary/SecondayEntityManagerHelper';
import { ITest } from '../../ITest';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

export class SecondaryEntityManagerHelperTest implements ITest {

  protected _declareName: string;

  public constructor() {
    this._declareName = SecondaryEntityManagerHelperTest.name;
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustBeInitializable();
    });
  }

  private _itMustBeInitializable(): void {
    const itsName = 'mustBeInitializable';
    it(itsName, async (done) => {
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new SecondaryEntityManagerHelper(null, null);
      }).not.toThrowError();
      done();
    }, MAX_SAFE_TIMEOUT);
  }
}
