import { AntSqlModel } from '../../model/AntSqlModel';
import { AntSqlSecondaryEntityManager } from '../../persistence/secondary/AntSqlSecondaryEntityManager';
import { ITest } from '../ITest';
import { DBConnectionWrapper } from './DBConnectionWrapper';
import { DBTestManager } from './DBTestManager';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const modelTestGen = (prefix: string) => new AntSqlModel(
  'id',
  { prefix: prefix },
  prefix.replace(/\//g, '_'),
);

export class AntSqlSecondaryEntityManagerTest implements ITest {
  /**
   * Before all task performed promise.
   */
  protected _beforeAllPromise: Promise<any>;
  /**
   * Database connection wrapper.
   */
  protected _dbConnectionWrapper: DBConnectionWrapper;
  /**
   * Database test manager.
   */
  protected _dbTestManager: DBTestManager;
  /**
   * Declare name for the test
   */
  protected _declareName: string;

  public constructor(beforeAllPromise: Promise<any>) {
    this._beforeAllPromise = beforeAllPromise;
    this._dbConnectionWrapper = new DBConnectionWrapper();
    this._dbTestManager = new DBTestManager();
    this._declareName = 'AntSqlSecondaryEntityManagerTest';
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustBeInitializable();
      this._itMustGetAnElementById();
      this._itMustGetAnUnexistingElementById();
      this._itMustGetMultipleElementsByIds();
    });
  }

  private _itMustBeInitializable(): void {
    const itsName = 'mustBeInitializable';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;
      const model = modelTestGen(prefix);
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new AntSqlSecondaryEntityManager(
          model,
          this._dbConnectionWrapper.dbConnection,
        );
      }).not.toThrowError();
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustGetAnElementById(): void {
    const itsName = 'mustGetAnElementById';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = modelTestGen(prefix);
      await this._dbTestManager.createTable(
        model.tableName,
        { name: 'id', type: 'number' },
      );
      const entity = { id: 2 };
      await this._dbTestManager.insert(model.tableName, entity);
      const manager = new AntSqlSecondaryEntityManager(
        model,
        this._dbConnectionWrapper.dbConnection,
      );

      const entityFound = await manager.getById(entity.id);
      expect(entityFound).toEqual(entity);

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustGetAnUnexistingElementById(): void {
    const itsName = 'mustGetAnUnexistingElementById';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = modelTestGen(prefix);
      await this._dbTestManager.createTable(
        model.tableName,
        { name: 'id', type: 'number' },
      );
      const manager = new AntSqlSecondaryEntityManager(
        model,
        this._dbConnectionWrapper.dbConnection,
      );

      const unexistingId = 1;
      const entityFound = await manager.getById(unexistingId);
      expect(entityFound).toBeNull();

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustGetMultipleElementsByIds(): void {
    const itsName = 'mustGetMultipleElementsByIds';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = modelTestGen(prefix);
      await this._dbTestManager.createTable(
        model.tableName,
        { name: 'id', type: 'number' },
      );
      const entity1 = { id: 1 };
      const entity2 = { id: 2 };
      await this._dbTestManager.insert(model.tableName, entity1);
      await this._dbTestManager.insert(model.tableName, entity2);
      const manager = new AntSqlSecondaryEntityManager(
        model,
        this._dbConnectionWrapper.dbConnection,
      );

      const entitiesFound = await manager.getByIds([
        entity1.id,
        entity2.id,
      ]);
      expect(entitiesFound).toContain(entity1);
      expect(entitiesFound).toContain(entity2);

      done();
    }, MAX_SAFE_TIMEOUT);
  }
}
