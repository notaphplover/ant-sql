import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { IKeyGenParams } from '@antjs/ant-js/src/model/IKeyGenParams';
import { AntSqlModel } from '../../model/AntSqlModel';
import { IAntSQLColumn } from '../../model/IAntSQLColumn';
import { IAntSqlModel } from '../../model/IAntSqlModel';
import { AntSqlSecondaryEntityManager } from '../../persistence/secondary/AntSqlSecondaryEntityManager';
import { ITest } from '../ITest';
import { DBConnectionWrapper } from './DBConnectionWrapper';
import { DBTestManager } from './DBTestManager';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const tableNameGenerator = (baseAlias: string) => baseAlias.replace(/\//g, '_');
const modelGenerator = (keyGen: IKeyGenParams, additionalColumns?: string[]): IAntSqlModel => {
  const columnsArgs: IAntSQLColumn[] = [{ entityAlias: 'id', sqlName: 'id' }];
  if (additionalColumns) {
    for (const column of additionalColumns) {
      columnsArgs.push({ entityAlias: column, sqlName: column });
    }
  }

  return new AntSqlModel(
    'id',
    keyGen,
    columnsArgs,
    (keyGen.prefix ? tableNameGenerator(keyGen.prefix) : '')
      + (keyGen.prefix && keyGen.suffix ? '_' : '')
      + (keyGen.suffix ? tableNameGenerator(keyGen.suffix) : ''),
  );
};
const namedModelGenerator = (keyGen: IKeyGenParams) => modelGenerator(keyGen, ['name']);

const tableGeneratorColumnId: { name: string, type: 'number'|'string' }
  = { name: 'id', type: 'number' };

const tableGeneratorOtherColumns: { [key: string]: 'string' | 'number'; }
  = { name: 'string' };

type EntityTest = { id: number } & IEntity;
type NamedEntityTest = {id: number, name: string} & IEntity;

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
      this._itMustDeleteAnEntity();
      this._itMustDeleteMultipleEntities();
      this._itMustDeleteZeroEntities();
      this._itMustGetAnElementById();
      this._itMustGetAnUnexistingElementById();
      this._itMustGetMultipleElementsByIds();
      this._itMustGetMultipleElementsByIdsOrderedAsc();
      this._itMustInsertAnEntity();
      this._itMustInsertMultieplEntities();
      this._itMustInsertZeroEntities();
      this._itMustUpdateAnEntity();
      this._itMustUpdateMultipleEntities();
      this._itMustUpdateZeroEntities();
    });
  }

  private _itMustBeInitializable(): void {
    const itsName = 'mustBeInitializable';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;
      const model = modelGenerator({prefix: prefix});
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

  private _itMustDeleteAnEntity(): void {
    const itsName = 'mustDeleteAnEntity';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = modelGenerator({ prefix: prefix });
      const entity: EntityTest = { id: 0 };
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
      );
      await this._dbTestManager.insert(model.tableName, entity);
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<EntityTest>(
        model,
        this._dbConnectionWrapper.dbConnection,
      );
      await secondaryEntityManager.delete(entity.id);
      expect(await secondaryEntityManager.getById(entity.id)).toBeNull();
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustDeleteMultipleEntities(): void {
    const itsName = 'mustDeleteMultipleEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = modelGenerator({ prefix: prefix });
      const entity: EntityTest = { id: 0 };
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
      );
      await this._dbTestManager.insert(model.tableName, entity);
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<EntityTest>(
        model,
        this._dbConnectionWrapper.dbConnection,
      );
      await secondaryEntityManager.mDelete([entity.id]);
      expect(await secondaryEntityManager.getById(entity.id)).toBeNull();
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustDeleteZeroEntities(): void {
    const itsName = 'mustDeleteZeroEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<NamedEntityTest>(
        model,
        this._dbConnectionWrapper.dbConnection,
      );

      expectAsync(secondaryEntityManager.mDelete(new Array())).toBeResolved();

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustGetAnElementById(): void {
    const itsName = 'mustGetAnElementById';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = modelGenerator({prefix: prefix});
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
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

      const model = modelGenerator({prefix: prefix});
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
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

      const model = modelGenerator({prefix: prefix});
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
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

  private _itMustGetMultipleElementsByIdsOrderedAsc(): void {
    const itsName = 'mustGetMultipleElementsByIdsOrderedAsc';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = modelGenerator({prefix: prefix});
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
      );
      const entity1 = { id: 1 };
      const entity2 = { id: 2 };
      await this._dbTestManager.insert(model.tableName, entity1);
      await this._dbTestManager.insert(model.tableName, entity2);
      const manager = new AntSqlSecondaryEntityManager(
        model,
        this._dbConnectionWrapper.dbConnection,
      );

      const entitiesFound = await manager.getByIdsOrderedAsc([
        entity1.id,
        entity2.id,
      ]);
      expect(entitiesFound).toEqual([entity1, entity2]);

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustInsertAnEntity(): void {
    const itsName = 'mustInsertAnEntity';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      const entity: NamedEntityTest = { id: 0, name: 'name' };
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<NamedEntityTest>(
        model,
        this._dbConnectionWrapper.dbConnection,
      );
      await secondaryEntityManager.insert(entity);
      expect(await secondaryEntityManager.getById(entity.id)).toEqual(entity);

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustInsertMultieplEntities(): void {
    const itsName = 'mustInsertMultieplEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      const entity: NamedEntityTest = { id: 0, name: 'name' };
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<NamedEntityTest>(
        model,
        this._dbConnectionWrapper.dbConnection,
      );
      await secondaryEntityManager.mInsert([entity]);
      expect(await secondaryEntityManager.getById(entity.id)).toEqual(entity);

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustInsertZeroEntities(): void {
    const itsName = 'mustInsertZeroEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<NamedEntityTest>(
        model,
        this._dbConnectionWrapper.dbConnection,
      );

      expectAsync(secondaryEntityManager.mInsert(new Array())).toBeResolved();

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustUpdateAnEntity(): void {
    const itsName = 'mustUpdateAnEntity';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      const entity: NamedEntityTest = { id: 0, name: 'name' };
      const entityAfter: NamedEntityTest = { id: 0, name: 'nameAfter' };
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );
      await this._dbTestManager.insert(model.tableName, entity);
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<NamedEntityTest>(
        model,
        this._dbConnectionWrapper.dbConnection,
      );
      await secondaryEntityManager.update(entityAfter);
      expect(await secondaryEntityManager.getById(entity.id)).toEqual(entityAfter);

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustUpdateMultipleEntities(): void {
    const itsName = 'mustUpdateMultipleEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      const entity: NamedEntityTest = { id: 0, name: 'name' };
      const entityAfter: NamedEntityTest = { id: 0, name: 'nameAfter' };
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );
      await this._dbTestManager.insert(model.tableName, entity);
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<NamedEntityTest>(
        model,
        this._dbConnectionWrapper.dbConnection,
      );
      await secondaryEntityManager.mUpdate([entityAfter]);
      expect(await secondaryEntityManager.getById(entity.id)).toEqual(entityAfter);

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustUpdateZeroEntities(): void {
    const itsName = 'mustUpdateZeroEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      await this._dbTestManager.createTable(
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );
      const secondaryEntityManager = new AntSqlSecondaryEntityManager<NamedEntityTest>(
        model,
        this._dbConnectionWrapper.dbConnection,
      );

      expectAsync(secondaryEntityManager.mUpdate(new Array())).toBeResolved();

      done();
    }, MAX_SAFE_TIMEOUT);
  }
}
