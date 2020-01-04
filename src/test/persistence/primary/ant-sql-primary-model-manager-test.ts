import * as Knex from 'knex';
import * as crypto from 'crypto';
import { Entity, KeyGenParams } from '@antjs/ant-js';
import { AntSqlModel } from '../../../model/ant-sql-model';
import { AntSqlPrimaryModelManager } from '../../../persistence/primary/ant-sql-primary-model-manager';
import { CacheMode } from '@antjs/ant-js/build/persistence/primary/options/cache-mode';
import { DBTestManager } from '../secondary/db-test-manager';
import { RedisWrapper } from './redis-wrapper';
import { SecondaryEntityManager } from '../../../persistence/secondary/secondary-entity-manager';
import { SqlDeleteOptions } from '../../../persistence/primary/options/sql-delete-options';
import { SqlModel } from '../../../model/sql-model';
import { SqlSecondaryEntityManager } from '../../../persistence/secondary/sql-secondary-entity-manager';
import { SqlType } from '../../../model/sql-type';
import { SqlUpdateOptions } from '../../../persistence/primary/options/sql-update-options';
import { Test } from '@antjs/ant-js/build/testapi/api/test';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const tableNameGenerator = (baseAlias: string): string =>
  't_' +
  crypto
    .createHash('md5')
    .update(baseAlias)
    .digest('hex');

const modelGenerator = (keyGen: KeyGenParams): SqlModel<EntityTest> => {
  return new AntSqlModel(
    'id',
    keyGen,
    [{ entityAlias: 'id', sqlName: 'id', type: SqlType.Integer }],
    tableNameGenerator(keyGen.prefix),
  );
};

type EntityTest = { id: number } & Entity;

export class AntSqlPrimaryModelManagerTest implements Test {
  /**
   * Before all task performed promise.
   */
  protected _beforeAllPromise: Promise<any>;
  /**
   * Database connection wrapper.
   */
  protected _dbConnection: Knex;
  /**
   * Database test manager.
   */
  protected _dbTestManager: DBTestManager;
  /**
   * Declare name for the test
   */
  protected _declareName: string;
  /**
   * Redis Wrapper
   */
  protected _redis: RedisWrapper;
  /**
   * Secondary entity manager generator.
   */
  protected _secondaryEntityManagerGenerator: <TEntity extends Entity>(
    model: SqlModel<TEntity>,
    knex: Knex,
  ) => SecondaryEntityManager<TEntity>;

  public constructor(
    beforeAllPromise: Promise<any>,
    dbConnection: Knex,
    dbAlias: string,
    secondaryEntityManagerGenerator: <TEntity extends Entity>(
      model: SqlModel<TEntity>,
      knex: Knex,
    ) => SecondaryEntityManager<TEntity>,
  ) {
    this._beforeAllPromise = beforeAllPromise;
    this._dbConnection = dbConnection;
    this._dbTestManager = new DBTestManager();
    this._declareName = AntSqlPrimaryModelManagerTest.name + '/' + dbAlias;
    this._redis = new RedisWrapper();
    this._secondaryEntityManagerGenerator = secondaryEntityManagerGenerator;
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustBeInitializable();
      this._itMustCallSecondaryEntityManagerMethods();
      this._itMustNotCallSecondaryLayerIfNoPersist();
      this._itMustParseAnEntityWithDateColumnsOnCacheHit();
    });
  }

  private _itMustBeInitializable(): void {
    const itsName = 'mustBeInitializable';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        const model = modelGenerator({ prefix });
        const secondaryEntityManager = new SqlSecondaryEntityManager<EntityTest>(model, this._dbConnection);
        expect(() => {
          new AntSqlPrimaryModelManager(model, this._redis.redis, true, secondaryEntityManager);
        }).not.toThrowError();
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustCallSecondaryEntityManagerMethods(): void {
    const itsName = 'mustCallSecondaryEntityManagerMethods';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        const model = modelGenerator({ prefix });
        const secondaryEntityManager = new SqlSecondaryEntityManager<EntityTest>(model, this._dbConnection);
        const sqlModelManager = new AntSqlPrimaryModelManager(model, this._redis.redis, true, secondaryEntityManager);
        const methodsToTest = ['delete', 'insert', 'mDelete', 'mInsert', 'mUpdate', 'update'] as Array<
          keyof SecondaryEntityManager<any>
        >;

        for (const methodToTest of methodsToTest) {
          spyOn(secondaryEntityManager, methodToTest as any).and.returnValue(
            new Promise((resolve) => resolve(methodToTest)),
          );
        }

        const entity: EntityTest = { id: 0 };

        await Promise.all([
          sqlModelManager.delete(entity.id),
          sqlModelManager.insert(entity),
          sqlModelManager.mDelete([entity.id]),
          sqlModelManager.mInsert([entity]),
          sqlModelManager.mUpdate([entity]),
          sqlModelManager.update(entity),
        ]);

        for (const methodToTest of methodsToTest) {
          expect(secondaryEntityManager[methodToTest]).toHaveBeenCalled();
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustNotCallSecondaryLayerIfNoPersist(): void {
    const itsName = 'mustNotCallSecondaryLayerIfNoPersist';
    const prefix = this._declareName + '/' + itsName + '/';

    it(
      itsName,
      async (done) => {
        const model = modelGenerator({ prefix });
        const secondaryEntityManager = new SqlSecondaryEntityManager<EntityTest>(model, this._dbConnection);
        const sqlModelManager = new AntSqlPrimaryModelManager(model, this._redis.redis, true, secondaryEntityManager);

        const methodsToTest = ['delete', 'insert', 'mDelete', 'mInsert', 'mUpdate', 'update'] as Array<
          keyof SecondaryEntityManager<any>
        >;

        for (const methodToTest of methodsToTest) {
          spyOn(secondaryEntityManager, methodToTest as any).and.returnValue(
            new Promise((resolve) => resolve(methodToTest)),
          );
        }

        const entity: EntityTest = { id: 0 };
        const deleteOptions: SqlDeleteOptions = {
          negativeCache: true,
          persist: false,
        };
        const updateOptions: SqlUpdateOptions = {
          cacheMode: CacheMode.CacheAndOverwrite,
          persist: false,
          ttl: null,
        };

        await Promise.all([
          sqlModelManager.delete(entity.id, deleteOptions),
          sqlModelManager.insert(entity, updateOptions),
          sqlModelManager.mDelete([entity.id], deleteOptions),
          sqlModelManager.mInsert([entity], updateOptions),
          sqlModelManager.mUpdate([entity], updateOptions),
          sqlModelManager.update(entity, updateOptions),
        ]);

        for (const methodToTest of methodsToTest) {
          expect(secondaryEntityManager[methodToTest]).not.toHaveBeenCalled();
        }

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustParseAnEntityWithDateColumnsOnCacheHit(): void {
    const itsName = 'mustParseAnEntityWithDateColumnsOnCacheHit';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;
        type EntityWithDateField = Entity & { id: number; field: Date; field2: Date };
        const model = new AntSqlModel<EntityWithDateField>(
          'id',
          { prefix },
          [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
            {
              entityAlias: 'field',
              sqlName: 'field',
              type: SqlType.Date,
            },
            {
              entityAlias: 'field2',
              sqlName: 'field2',
              type: SqlType.Date,
            },
          ],
          tableNameGenerator(prefix),
        );
        await this._dbTestManager.createTable(
          this._dbConnection,
          model.tableName,
          { name: 'id', type: 'number' },
          { field: 'datetime', field2: 'datetime' },
        );
        const secondaryEntityManager = this._secondaryEntityManagerGenerator(model, this._dbConnection);
        const sqlModelManager = new AntSqlPrimaryModelManager(model, this._redis.redis, true, secondaryEntityManager);

        const entity: EntityWithDateField = {
          field: new Date(),
          field2: new Date(),
          id: 0,
        };

        await sqlModelManager.insert(entity);
        const entityFound = await sqlModelManager.get(entity.id);

        expect(entityFound).toEqual(entity);
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }
}
