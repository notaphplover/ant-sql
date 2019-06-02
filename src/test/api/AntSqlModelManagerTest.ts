import { ModelManager } from '@antjs/ant-js/src/persistence/primary/ModelManager';
import { PrimaryEntityManager } from '@antjs/ant-js/src/persistence/primary/PrimaryEntityManager';
import { IAntSqlModelConfig } from '../../api/config/IAntSqlModelConfig';
import { AntSqlModel } from '../../model/AntSqlModel';
import { AntSqlSecondaryEntityManager } from '../../persistence/secondary/AntSqlSecondaryEntityManager';
import { ITest } from '../ITest';
import { RedisWrapper } from '../primary/RedisWrapper';
import { DBConnectionWrapper } from '../secondary/DBConnectionWrapper';
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
  protected _dbConnectionWrapper: DBConnectionWrapper;
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
   */
  public constructor() {
    this._dbConnectionWrapper = new DBConnectionWrapper();
    this._declareName = 'AntSqlModelManagerTest';
    this._redisWrapper = new RedisWrapper();
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustGenerateAModelManager();
      this._itMustGenerateASecondaryEntityManager();
    });
  }

  private _itMustGenerateAModelManager(): void {
    const itsName = 'mustGenerateAModelManager';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      const model = modelTestGen(prefix);
      const config: IAntSqlModelConfig = {
        knex: this._dbConnectionWrapper.dbConnection,
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
        knex: this._dbConnectionWrapper.dbConnection,
        redis: this._redisWrapper.redis,
      };
      const antModelManager = new AntSqlModelManagerForTest(model, new Map());
      const secondaryEntityManager = antModelManager.generateSecondaryEntityManager(model, config);
      expect(secondaryEntityManager instanceof AntSqlSecondaryEntityManager).toBe(true);
      done();
    }, MAX_SAFE_TIMEOUT);
  }
}
