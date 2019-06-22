import { ModelManager } from '@antjs/ant-js/src/persistence/primary/ModelManager';
import * as Knex from 'knex';
import { IAntSqlModelConfig } from '../../api/config/IAntSqlModelConfig';
import { AntSqlModel } from '../../model/AntSqlModel';
import { ISqlModelManager } from '../../persistence/primary/ISqlModelManager';
import { AntSqlSecondaryEntityManager } from '../../persistence/secondary/AntSqlSecondaryEntityManager';
import { ITest } from '../ITest';
import { RedisWrapper } from '../persistence/primary/RedisWrapper';
import { AntSqlModelManagerForTest } from './AntSqlModelManagerForTest';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const modelTestGen = (prefix: string) => new AntSqlModel(
  'id',
  { prefix: prefix },
  [{
    entityAlias: 'id',
    sqlName: 'id',
  }],
  prefix.replace(/\//g, '_'),
);

export class AntSqlModelManagerTest implements ITest {
  /**
   * Database connection wrapper.
   */
  protected _dbConnection: Knex;
  /**
   * Declare name for the test
   */
  protected _declareName: string;
  /**
   * Redis connection wrapper.
   */
  protected _redisWrapper: RedisWrapper;

  /**
   * Creates a new test instance for AntSqlModelManager.
   * @param dbConnection Knex DB connection.
   */
  public constructor(dbConnection: Knex, dbAlias: string) {
    this._dbConnection = dbConnection;
    this._declareName = AntSqlModelManagerTest.name + '/' + dbAlias;
    this._redisWrapper = new RedisWrapper();
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustCallModelManagerMethods();
      this._itMustGenerateAModelManager();
      this._itMustGenerateASecondaryEntityManager();
    });
  }

  private _itMustCallModelManagerMethods(): void {
    const itsName = 'mustCallModelManagerMethods';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      const model = modelTestGen(prefix);
      const antModelManager = new AntSqlModelManagerForTest(model, new Map());
      antModelManager.config({
        knex: this._dbConnection,
        redis: this._redisWrapper.redis,
      });
      const modelManager = antModelManager.modelManager;

      const methodsToTest = [
        'insert',
        'mInsert',
      ] as Array<keyof ISqlModelManager<any>>;

      for (const methodToTest of methodsToTest) {
        spyOn(modelManager, methodToTest as any).and.returnValue(methodToTest as any);
      }

      const entity = { id: 0 };

      const [
        insertResult,
        mInsertResult,
      ] = await Promise.all([
        antModelManager.insert(entity),
        antModelManager.mInsert([entity]),
      ]);

      const results: {[key: string]: any} = {
        insert: insertResult,
        mInsert: mInsertResult,
      };

      for (const methodToTest of methodsToTest) {
        expect(modelManager[methodToTest]).toHaveBeenCalled();
        expect(results[methodToTest]).toBe(methodToTest);
      }

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustGenerateAModelManager(): void {
    const itsName = 'mustGenerateAModelManager';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      const model = modelTestGen(prefix);
      const config: IAntSqlModelConfig = {
        knex: this._dbConnection,
        redis: this._redisWrapper.redis,
      };
      const antModelManager = new AntSqlModelManagerForTest(model, new Map());
      const modelManager = antModelManager.generateModelManager(model, config);
      expect(modelManager instanceof ModelManager).toBe(true);
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustGenerateASecondaryEntityManager(): void {
    const itsName = 'mustGenerateASecondaryEntityManager';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      const model = modelTestGen(prefix);
      const config: IAntSqlModelConfig = {
        knex: this._dbConnection,
        redis: this._redisWrapper.redis,
      };
      const antModelManager = new AntSqlModelManagerForTest(model, new Map());
      const secondaryEntityManager = antModelManager.generateSecondaryEntityManager(model, config);
      expect(secondaryEntityManager instanceof AntSqlSecondaryEntityManager).toBe(true);
      done();
    }, MAX_SAFE_TIMEOUT);
  }
}
