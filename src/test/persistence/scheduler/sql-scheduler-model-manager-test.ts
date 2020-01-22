import { AntSqlModel } from '../../../model/ant-sql-model';
import { Entity } from '@antjs/ant-js';
import { PrimaryModelManager } from '@antjs/ant-js/build/persistence/primary/primary-model-manager';
import { SecondaryEntityManager } from '../../../persistence/secondary/secondary-entity-manager';
import { SqlSchedulerModelManager } from '../../../persistence/scheduler/sql-scheduler-model-manager';
import { SqlType } from '../../../model/sql-type';
import { Test } from '@antjs/ant-js/build/testapi/api/test';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const secondaryManagerMockGenerator: () => SecondaryEntityManager<Entity> = () => {
  return {
    delete: (): Promise<any> => Promise.resolve(),
    getById: (): Promise<Entity> => Promise.resolve(null),
    getByIds: (): Promise<Entity[]> => Promise.resolve(new Array()),
    getByIdsOrderedAsc: (): Promise<Entity[]> => Promise.resolve(new Array()),
    insert: (): Promise<any> => Promise.resolve(),
    mDelete: (): Promise<any> => Promise.resolve(),
    mInsert: (): Promise<any> => Promise.resolve(),
    mUpdate: (): Promise<any> => Promise.resolve(),
    model: null,
    update: (): Promise<any> => Promise.resolve(),
  };
};

const primaryManagerMockGenerator: () => PrimaryModelManager<Entity> = () => {
  const manager = {
    addQuery: (): PrimaryModelManager<Entity> => manager,
    delete: (): Promise<any> => Promise.resolve(),
    get: (): Promise<Entity> => Promise.resolve(null),
    mDelete: (): Promise<any> => Promise.resolve(),
    mGet: (): Promise<Entity[]> => Promise.resolve(new Array()),
    mUpdate: (): Promise<any> => Promise.resolve(),
    update: (): Promise<any> => Promise.resolve(),
  };
  return manager;
};

export class SqlSchedulerModelManagerTest implements Test {
  /**
   * Declare name for the test
   */
  protected _declareName: string;

  public constructor() {
    this._declareName = SqlSchedulerModelManagerTest.name;
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustCallPrimaryManagerOnInsertMethod();
      this._itMustCallPrimaryManagerOnUpdateMethod();
      this._itMustCallSecondaryManagerOnInsertMethod();
      this._itMustCallSecondaryManagerOnUpdateMethod();
      this._itMustIgnorePrimaryManagerOnInsertMethod();
      this._itMustIgnorePrimaryManagerOnUpdateMethod();
      this._itMustIgnoreSecondaryManagerOnInsertMethod();
      this._itMustIgnoreSecondaryManagerOnUpdateMethod();
    });
  }

  private _itMustCallPrimaryManagerOnInsertMethod(): void {
    it(
      'must call primary manager on insert methods',
      async (done) => {
        const model = new AntSqlModel(
          'id',
          { prefix: 'sample' },
          [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          'sample-table',
          'sample-alias',
        );
        const secondaryManager = secondaryManagerMockGenerator();
        const primaryManager = primaryManagerMockGenerator();
        const schedulerManager = new SqlSchedulerModelManager(model, primaryManager, secondaryManager);

        const methodsToTest: Array<keyof PrimaryModelManager<any>> = ['mUpdate', 'update'];
        for (const methodToTest of methodsToTest) {
          spyOn(primaryManager, methodToTest as any).and.callThrough();
        }

        const entity: Entity = { id: 0 };

        await Promise.all([schedulerManager.insert(entity.id), schedulerManager.mInsert(entity.id)]);

        for (const methodToTest of methodsToTest) {
          expect(primaryManager[methodToTest]).toHaveBeenCalled();
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustCallPrimaryManagerOnUpdateMethod(): void {
    it(
      'must call primary manager on update methods',
      async (done) => {
        const model = new AntSqlModel(
          'id',
          { prefix: 'sample' },
          [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          'sample-table',
          'sample-alias',
        );
        const secondaryManager = secondaryManagerMockGenerator();
        const primaryManager = primaryManagerMockGenerator();
        const schedulerManager = new SqlSchedulerModelManager(model, primaryManager, secondaryManager);

        const methodsToTest: Array<keyof PrimaryModelManager<any>> = ['mUpdate', 'update'];
        for (const methodToTest of methodsToTest) {
          spyOn(primaryManager, methodToTest as any).and.callThrough();
        }

        const entity: Entity = { id: 0 };

        await Promise.all([schedulerManager.mUpdate([entity.id]), schedulerManager.update([entity.id])]);

        for (const methodToTest of methodsToTest) {
          expect(primaryManager[methodToTest]).toHaveBeenCalled();
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustCallSecondaryManagerOnInsertMethod(): void {
    it(
      'must call secondary manager on insert methods',
      async (done) => {
        const model = new AntSqlModel(
          'id',
          { prefix: 'sample' },
          [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          'sample-table',
          'sample-alias',
        );
        const secondaryManager = secondaryManagerMockGenerator();
        const primaryManager = primaryManagerMockGenerator();
        const schedulerManager = new SqlSchedulerModelManager(model, primaryManager, secondaryManager);

        const methodsToTest: Array<keyof SecondaryEntityManager<any>> = ['insert', 'mInsert'];
        for (const methodToTest of methodsToTest) {
          spyOn(secondaryManager, methodToTest as any).and.callThrough();
        }

        const entity: Entity = { id: 0 };

        await Promise.all([schedulerManager.insert(entity.id), schedulerManager.mInsert(entity.id)]);

        for (const methodToTest of methodsToTest) {
          expect(secondaryManager[methodToTest]).toHaveBeenCalled();
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustCallSecondaryManagerOnUpdateMethod(): void {
    it(
      'must call secondary manager on update methods',
      async (done) => {
        const model = new AntSqlModel(
          'id',
          { prefix: 'sample' },
          [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          'sample-table',
          'sample-alias',
        );
        const secondaryManager = secondaryManagerMockGenerator();
        const primaryManager = primaryManagerMockGenerator();
        const schedulerManager = new SqlSchedulerModelManager(model, primaryManager, secondaryManager);

        const methodsToTest: Array<keyof SecondaryEntityManager<any>> = ['mUpdate', 'update'];
        for (const methodToTest of methodsToTest) {
          spyOn(secondaryManager, methodToTest as any).and.callThrough();
        }

        const entity: Entity = { id: 0 };

        await Promise.all([schedulerManager.mUpdate([entity.id]), schedulerManager.update([entity.id])]);

        for (const methodToTest of methodsToTest) {
          expect(secondaryManager[methodToTest]).toHaveBeenCalled();
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustIgnorePrimaryManagerOnInsertMethod(): void {
    it(
      'must ignore primary manager on insert methods',
      async (done) => {
        const model = new AntSqlModel(
          'id',
          { prefix: 'sample' },
          [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          'sample-table',
          'sample-alias',
        );
        const secondaryManager = secondaryManagerMockGenerator();
        const primaryManager = primaryManagerMockGenerator();
        const schedulerManager = new SqlSchedulerModelManager(model, primaryManager, secondaryManager);

        const methodsToTest: Array<keyof PrimaryModelManager<any>> = ['mUpdate', 'update'];
        for (const methodToTest of methodsToTest) {
          spyOn(primaryManager, methodToTest as any).and.callThrough();
        }

        const entity: Entity = { id: 0 };

        await Promise.all([
          schedulerManager.insert(entity.id, { ignorePrimaryLayer: true }),
          schedulerManager.mInsert(entity.id, { ignorePrimaryLayer: true }),
        ]);

        for (const methodToTest of methodsToTest) {
          expect(primaryManager[methodToTest]).not.toHaveBeenCalled();
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustIgnorePrimaryManagerOnUpdateMethod(): void {
    it(
      'must ignore primary manager on update methods',
      async (done) => {
        const model = new AntSqlModel(
          'id',
          { prefix: 'sample' },
          [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          'sample-table',
          'sample-alias',
        );
        const secondaryManager = secondaryManagerMockGenerator();
        const primaryManager = primaryManagerMockGenerator();
        const schedulerManager = new SqlSchedulerModelManager(model, primaryManager, secondaryManager);

        const methodsToTest: Array<keyof PrimaryModelManager<any>> = ['mUpdate', 'update'];
        for (const methodToTest of methodsToTest) {
          spyOn(primaryManager, methodToTest as any).and.callThrough();
        }

        const entity: Entity = { id: 0 };

        await Promise.all([
          schedulerManager.mUpdate([entity.id], { ignorePrimaryLayer: true }),
          schedulerManager.update([entity.id], { ignorePrimaryLayer: true }),
        ]);

        for (const methodToTest of methodsToTest) {
          expect(primaryManager[methodToTest]).not.toHaveBeenCalled();
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustIgnoreSecondaryManagerOnInsertMethod(): void {
    it(
      'must ignore secondary manager on insert methods',
      async (done) => {
        const model = new AntSqlModel(
          'id',
          { prefix: 'sample' },
          [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          'sample-table',
          'sample-alias',
        );
        const secondaryManager = secondaryManagerMockGenerator();
        const primaryManager = primaryManagerMockGenerator();
        const schedulerManager = new SqlSchedulerModelManager(model, primaryManager, secondaryManager);

        const methodsToTest: Array<keyof SecondaryEntityManager<any>> = ['insert', 'mInsert'];
        for (const methodToTest of methodsToTest) {
          spyOn(secondaryManager, methodToTest as any).and.callThrough();
        }

        const entity: Entity = { id: 0 };

        await Promise.all([
          schedulerManager.insert(entity.id, { ignoreSecondaryLayer: true }),
          schedulerManager.mInsert(entity.id, { ignoreSecondaryLayer: true }),
        ]);

        for (const methodToTest of methodsToTest) {
          expect(secondaryManager[methodToTest]).not.toHaveBeenCalled();
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustIgnoreSecondaryManagerOnUpdateMethod(): void {
    it(
      'must ignore secondary manager on update methods',
      async (done) => {
        const model = new AntSqlModel(
          'id',
          { prefix: 'sample' },
          [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          'sample-table',
          'sample-alias',
        );
        const secondaryManager = secondaryManagerMockGenerator();
        const primaryManager = primaryManagerMockGenerator();
        const schedulerManager = new SqlSchedulerModelManager(model, primaryManager, secondaryManager);

        const methodsToTest: Array<keyof SecondaryEntityManager<any>> = ['mUpdate', 'update'];
        for (const methodToTest of methodsToTest) {
          spyOn(secondaryManager, methodToTest as any).and.callThrough();
        }

        const entity: Entity = { id: 0 };

        await Promise.all([
          schedulerManager.mUpdate([entity.id], { ignoreSecondaryLayer: true }),
          schedulerManager.update([entity.id], { ignoreSecondaryLayer: true }),
        ]);

        for (const methodToTest of methodsToTest) {
          expect(secondaryManager[methodToTest]).not.toHaveBeenCalled();
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }
}
