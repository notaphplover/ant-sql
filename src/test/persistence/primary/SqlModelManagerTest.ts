import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { IKeyGenParams } from '@antjs/ant-js/src/model/IKeyGenParams';
import { ITest } from '@antjs/ant-js/src/testapi/api/ITest';
import * as crypto from 'crypto';
import * as Knex from 'knex';
import { AntSqlModel } from '../../../model/AntSqlModel';
import { IAntSqlModel } from '../../../model/IAntSqlModel';
import { SqlModelManager } from '../../../persistence/primary/SqlModelManager';
import { AntSqlSecondaryEntityManager } from '../../../persistence/secondary/AntSqlSecondaryEntityManager';
import { ISqlSecondaryEntityManager } from '../../../persistence/secondary/ISqlSecondaryEntityManager';
import { RedisWrapper } from './RedisWrapper';
import { IAntSqlDeleteOptions } from '../../../persistence/primary/options/IAntSqlDeleteOptions';
import { IAntSqlUpdateOptions } from '../../../persistence/primary/options/IAntSqlUpdateOptions';
import { CacheMode } from '@antjs/ant-js/src/persistence/primary/options/CacheMode';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const tableNameGenerator = (baseAlias: string) =>
  't_'
  + crypto
    .createHash('md5')
    .update(baseAlias)
    .digest('hex');

const modelGenerator = (keyGen: IKeyGenParams): IAntSqlModel => {
  return new AntSqlModel(
    'id',
    keyGen,
    [{ entityAlias: 'id', sqlName: 'id' }],
    (keyGen.prefix ? tableNameGenerator(keyGen.prefix) : '')
      + (keyGen.prefix && keyGen.suffix ? '_' : '')
      + (keyGen.suffix ? tableNameGenerator(keyGen.suffix) : ''),
  );
};

type EntityTest = { id: number } & IEntity;

export class SqlModelManagerTest implements ITest {

  /**
   * Database connection wrapper.
   */
  protected _dbConnection: Knex;
  /**
   * Declare name for the test
   */
  protected _declareName: string;
  /**
   * Redis Wrapper
   */
  protected _redis: RedisWrapper;

  public constructor(dbConnection: Knex, dbAlias: string) {
    this._dbConnection = dbConnection;
    this._declareName = SqlModelManagerTest.name + '/' + dbAlias;
    this._redis = new RedisWrapper();
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustBeInitializable();
      this._itMustCallSecondaryEntityManagerMethods();
      this._itMustNotCallSecondaryLayerIfNoPersist();
    });
  }

  private _itMustBeInitializable(): void {
    const itsName = 'mustBeInitializable';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      const model = modelGenerator({ prefix: prefix });
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<EntityTest>(
        model,
        this._dbConnection,
      );
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new SqlModelManager(
          model,
          this._redis.redis,
          true,
          secondaryEntityManager,
        );
      }).not.toThrowError();
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustCallSecondaryEntityManagerMethods(): void {
    const itsName = 'mustCallSecondaryEntityManagerMethods';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      const model = modelGenerator({ prefix: prefix });
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<EntityTest>(
        model,
        this._dbConnection,
      );
      const sqlModelManager = new SqlModelManager(
        model,
        this._redis.redis,
        true,
        secondaryEntityManager,
      );
      const methodsToTest = [
        'delete',
        'insert',
        'mDelete',
        'mInsert',
        'mUpdate',
        'update',
      ] as Array<keyof ISqlSecondaryEntityManager<any>>;

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
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustNotCallSecondaryLayerIfNoPersist(): void {
    const itsName = 'mustNotCallSecondaryLayerIfNoPersist';
    const prefix = this._declareName + '/' + itsName + '/';

    it(itsName, async (done) => {
      const model = modelGenerator({ prefix: prefix });
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<EntityTest>(
        model,
        this._dbConnection,
      );
      const sqlModelManager = new SqlModelManager(
        model,
        this._redis.redis,
        true,
        secondaryEntityManager,
      );

      const methodsToTest = [
        'delete',
        'insert',
        'mDelete',
        'mInsert',
        'mUpdate',
        'update',
      ] as Array<keyof ISqlSecondaryEntityManager<any>>;

      for (const methodToTest of methodsToTest) {
        spyOn(secondaryEntityManager, methodToTest as any).and.returnValue(
          new Promise((resolve) => resolve(methodToTest)),
        );
      }

      const entity: EntityTest = { id: 0 };
      const deleteOptions: IAntSqlDeleteOptions = {
        negativeCache: true,
        persist: false,
      };
      const updateOptions: IAntSqlUpdateOptions = {
        cacheMode: CacheMode.CacheAndOverwrite,
        persist: false,
        ttl: null,
      }

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
    }, MAX_SAFE_TIMEOUT);
  }
}
