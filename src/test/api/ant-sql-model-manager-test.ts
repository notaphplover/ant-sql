import * as Knex from 'knex';
import { AntSqlModel } from '../../model/ant-sql-model';
import { AntSqlModelManagerForTest } from './ant-sql-model-manager-for-test';
import { ApiSqlModelConfig } from '../../api/config/api-sql-model-config';
import { Entity } from '@antjs/ant-js';
import { QueryConfigFactory } from '../../api/config/query-config-factory';
import { RedisWrapper } from '../persistence/primary/redis-wrapper';
import { SchedulerModelManager } from '../../persistence/scheduler/scheduler-model-manager';
import { SqlSchedulerModelManager } from '../../persistence/scheduler/sql-scheduler-model-manager';
import { SqlType } from '../../model/sql-type';
import { Test } from '@antjs/ant-js/build/testapi/api/test';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const modelTestGen = (prefix: string): AntSqlModel<Entity> =>
  new AntSqlModel(
    'id',
    { prefix },
    [
      {
        entityAlias: 'id',
        sqlName: 'id',
        type: SqlType.Integer,
      },
    ],
    prefix.replace(/\//g, '_'),
  );

export class AntSqlModelManagerTest implements Test {
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
      this._itMustGenerateAnSchedulerManager();
      this._itMustGenerateAReference();
      this._itMustReturnQueryConfigFactoryIfConfigIsSet();
      this._itMustNotReturnQueryConfigFactoryIfConfigIsNotSet();
    });
  }

  private _itMustCallModelManagerMethods(): void {
    const itsName = 'mustCallModelManagerMethods';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        const model = modelTestGen(prefix);
        const antModelManager = new AntSqlModelManagerForTest(model);
        antModelManager.config({
          knex: this._dbConnection,
          redis: this._redisWrapper.redis,
        });
        const manager = antModelManager.scheduledManager;

        const methodsToTest = ['insert', 'mInsert', 'mUpdate', 'update'] as Array<keyof SchedulerModelManager<any>>;

        for (const methodToTest of methodsToTest) {
          spyOn(manager, methodToTest as any).and.returnValue(methodToTest as any);
        }

        const entity = { id: 0 };

        const [insertResult, mInsertResult, mUpdateResult, updateResult] = await Promise.all([
          antModelManager.insert(entity),
          antModelManager.mInsert([entity]),
          antModelManager.mUpdate([entity]),
          antModelManager.update(entity),
        ]);

        const results: { [key: string]: any } = {
          insert: insertResult,
          mInsert: mInsertResult,
          mUpdate: mUpdateResult,
          update: updateResult,
        };

        for (const methodToTest of methodsToTest) {
          expect(manager[methodToTest]).toHaveBeenCalled();
          expect(results[methodToTest]).toBe(methodToTest);
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustGenerateAnSchedulerManager(): void {
    const itsName = 'mustGenerateAnSchedulerManager';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        const model = modelTestGen(prefix);
        const config: ApiSqlModelConfig = {
          knex: this._dbConnection,
          redis: this._redisWrapper.redis,
        };
        const antModelManager = new AntSqlModelManagerForTest(model);
        const manager = antModelManager.generateSchedulerManager(model, config);
        expect(manager instanceof SqlSchedulerModelManager).toBe(true);
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustGenerateAReference(): void {
    const itsName = 'must generate an SQL reference';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        const model = modelTestGen(prefix);
        const antModelManager = new AntSqlModelManagerForTest(model);
        const id = 3;
        const reference = antModelManager.getReference(id);

        expect(reference.id).toBe(id);
        expect(reference.entity).toBeNull();
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustReturnQueryConfigFactoryIfConfigIsSet(): void {
    const itsName = 'it must return a query config factory if the model manager is configured';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        const model = modelTestGen(prefix);
        const config: ApiSqlModelConfig = {
          knex: this._dbConnection,
          redis: this._redisWrapper.redis,
        };
        const antModelManager = new AntSqlModelManagerForTest(model).config(config);
        const queryConfigFactory = antModelManager.cfgGen;
        expect(queryConfigFactory instanceof QueryConfigFactory).toBe(true);
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustNotReturnQueryConfigFactoryIfConfigIsNotSet(): void {
    const itsName = 'it must not return a query config factory if the model manager is not configured';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        const model = modelTestGen(prefix);
        const antModelManager = new AntSqlModelManagerForTest(model);
        expect(() => antModelManager.cfgGen).toThrowError();
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }
}
