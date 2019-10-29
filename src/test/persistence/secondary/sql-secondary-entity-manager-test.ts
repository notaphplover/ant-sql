import { Entity, KeyGenParams } from '@antjs/ant-js';
import { Test } from '@antjs/ant-js/build/testapi/api/test';
import * as Knex from 'knex';
import { SqlModel } from '../../../model/sql-model';
import { SecondaryEntityManager } from '../../../persistence/secondary/secondary-entity-manager';
import { modelGenerator } from '../../model/ant-sql-model-generator';
import { DBTestManager } from './db-test-manager';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const namedModelGenerator = (keyGen: KeyGenParams, autoGeneratedId: boolean = false) =>
  modelGenerator(keyGen, ['name'], autoGeneratedId ? 'id' : null);

const tableGeneratorColumnId: { name: string; type: 'number' | 'string' } = { name: 'id', type: 'number' };

const tableGeneratorOtherColumns: { [key: string]: 'string' | 'number' } = { name: 'string' };

type EntityTest = { id: number } & Entity;
type NamedEntityTest = { id: number; name: string } & Entity;

export class SqlSecondaryEntityManagerTest implements Test {
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
   * Secondary entity manager generator.
   */
  protected _secondaryEntityManagerGenerator: <TEntity extends Entity>(
    model: SqlModel,
    knex: Knex,
  ) => SecondaryEntityManager<TEntity>;

  public constructor(
    beforeAllPromise: Promise<any>,
    dbConnection: Knex,
    dbAlias: string,
    secondaryEntityManagerGenerator: <TEntity extends Entity>(
      model: SqlModel,
      knex: Knex,
    ) => SecondaryEntityManager<TEntity>,
  ) {
    this._beforeAllPromise = beforeAllPromise;
    this._dbConnection = dbConnection;
    this._dbTestManager = new DBTestManager();
    this._declareName = SqlSecondaryEntityManagerTest.name + '/' + dbAlias;
    this._secondaryEntityManagerGenerator = secondaryEntityManagerGenerator;
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustBeInitializable();
      this._itMustDeleteAnEntity();
      this._itMustDeleteMultipleEntities();
      this._itMustDeleteZeroEntities();
      this._itMustGetAnElementById();
      this._itMustGetAnElementByIdWithMappings();
      this._itMustGetAnUnexistingElementById();
      this._itMustGetMultipleElementsByIds();
      this._itMustGetMultipleElementsByIdsOrderedAsc();
      this._itMustGetMultipleElementsByIdsOrderedAscWithMappings();
      this._itMustGetMultipleElementsByIdsWithMappings();
      this._itMustInsertAnEntity();
      this._itMustInsertAnEntityWithAutoIncrementStrategy();
      this._itMustInsertMultieplEntities();
      this._itMustInsertMultipleEntitiesWithAutoIncrementStrategy();
      this._itMustInsertZeroEntities();
      this._itMustUpdateAnEntity();
      this._itMustUpdateMultipleEntities();
      this._itMustUpdateZeroEntities();
    });
  }

  private _itMustBeInitializable(): void {
    const itsName = 'mustBeInitializable';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;
        const model = modelGenerator({ prefix: prefix });
        expect(() => {
          this._secondaryEntityManagerGenerator(model, this._dbConnection);
        }).not.toThrowError();
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustDeleteAnEntity(): void {
    const itsName = 'mustDeleteAnEntity';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = modelGenerator({ prefix: prefix });
        const entity: EntityTest = { id: 0 };
        await this._dbTestManager.createTable(this._dbConnection, model.tableName, tableGeneratorColumnId);
        await this._dbTestManager.insert(this._dbConnection, model.tableName, entity);
        const secondaryEntityManager = this._secondaryEntityManagerGenerator(model, this._dbConnection);
        await secondaryEntityManager.delete(entity.id);
        expect(await secondaryEntityManager.getById(entity.id)).toBeNull();
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustDeleteMultipleEntities(): void {
    const itsName = 'mustDeleteMultipleEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = modelGenerator({ prefix: prefix });
        const entity: EntityTest = { id: 0 };
        await this._dbTestManager.createTable(this._dbConnection, model.tableName, tableGeneratorColumnId);
        await this._dbTestManager.insert(this._dbConnection, model.tableName, entity);
        const secondaryEntityManager = this._secondaryEntityManagerGenerator(model, this._dbConnection);
        await secondaryEntityManager.mDelete([entity.id]);
        expect(await secondaryEntityManager.getById(entity.id)).toBeNull();
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustDeleteZeroEntities(): void {
    const itsName = 'mustDeleteZeroEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = namedModelGenerator({ prefix: prefix });
        await this._dbTestManager.createTable(
          this._dbConnection,
          model.tableName,
          tableGeneratorColumnId,
          tableGeneratorOtherColumns,
        );
        const secondaryEntityManager = this._secondaryEntityManagerGenerator(model, this._dbConnection);

        expectAsync(secondaryEntityManager.mDelete(new Array())).toBeResolved();

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustGetAnElementById(): void {
    const itsName = 'mustGetAnElementById';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = modelGenerator({ prefix: prefix });
        await this._dbTestManager.createTable(this._dbConnection, model.tableName, tableGeneratorColumnId);
        const entity = { id: 2 };
        await this._dbTestManager.insert(this._dbConnection, model.tableName, entity);
        const manager = this._secondaryEntityManagerGenerator(model, this._dbConnection);

        const entityFound = await manager.getById(entity.id);
        expect({ ...entityFound }).toEqual(entity);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustGetAnElementByIdWithMappings(): void {
    const itsName = 'mustGetAnElementByIdWithMappings';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model: SqlModel = modelGenerator({ prefix: prefix }, { name: 'sqlName' });
        await this._dbTestManager.createTable(this._dbConnection, model.tableName, tableGeneratorColumnId, {
          sqlName: 'string',
        });
        const entity = { id: 2, name: 'Just a name' };
        const manager = this._secondaryEntityManagerGenerator(model, this._dbConnection);
        await manager.insert(entity);

        const entityFound = await manager.getById(entity.id);
        expect(entityFound).toEqual(entity);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustGetAnUnexistingElementById(): void {
    const itsName = 'mustGetAnUnexistingElementById';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = modelGenerator({ prefix: prefix });
        await this._dbTestManager.createTable(this._dbConnection, model.tableName, tableGeneratorColumnId);
        const manager = this._secondaryEntityManagerGenerator(model, this._dbConnection);

        const unexistingId = 1;
        const entityFound = await manager.getById(unexistingId);
        expect(entityFound).toBeNull();

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustGetMultipleElementsByIds(): void {
    const itsName = 'mustGetMultipleElementsByIds';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = modelGenerator({ prefix: prefix });
        await this._dbTestManager.createTable(this._dbConnection, model.tableName, tableGeneratorColumnId);
        const entity1 = { id: 1 };
        const entity2 = { id: 2 };
        await this._dbTestManager.insert(this._dbConnection, model.tableName, entity1);
        await this._dbTestManager.insert(this._dbConnection, model.tableName, entity2);
        const manager = this._secondaryEntityManagerGenerator(model, this._dbConnection);

        const entitiesFound = await manager.getByIds([entity1.id, entity2.id]);
        const entitiesFoundAsObjects = entitiesFound.map((entity) => ({ ...entity }));

        expect(entitiesFoundAsObjects).toContain(entity1);
        expect(entitiesFoundAsObjects).toContain(entity2);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustGetMultipleElementsByIdsOrderedAsc(): void {
    const itsName = 'mustGetMultipleElementsByIdsOrderedAsc';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = modelGenerator({ prefix: prefix });
        await this._dbTestManager.createTable(this._dbConnection, model.tableName, tableGeneratorColumnId);
        const entity1 = { id: 1 };
        const entity2 = { id: 2 };
        await this._dbTestManager.insert(this._dbConnection, model.tableName, entity1);
        await this._dbTestManager.insert(this._dbConnection, model.tableName, entity2);
        const manager = this._secondaryEntityManagerGenerator(model, this._dbConnection);

        const entitiesFound = await manager.getByIdsOrderedAsc([entity1.id, entity2.id]);
        const entitiesFoundAsObjects = entitiesFound.map((entity) => ({ ...entity }));

        expect(entitiesFoundAsObjects).toEqual([entity1, entity2]);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustGetMultipleElementsByIdsOrderedAscWithMappings(): void {
    const itsName = 'mustGetMultipleElementsByIdsOrderedAscWithMappings';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model: SqlModel = modelGenerator({ prefix: prefix }, { name: 'sqlName' });
        await this._dbTestManager.createTable(this._dbConnection, model.tableName, tableGeneratorColumnId, {
          sqlName: 'string',
        });
        const entity = { id: 2, name: 'Just a name' };
        const manager = this._secondaryEntityManagerGenerator(model, this._dbConnection);
        await manager.insert(entity);

        const entitiesFound = await manager.getByIdsOrderedAsc([entity.id]);
        expect(entitiesFound).toContain(entity);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustGetMultipleElementsByIdsWithMappings(): void {
    const itsName = 'mustGetMultipleElementsByIdsWithMappings';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model: SqlModel = modelGenerator({ prefix: prefix }, { name: 'sqlName' });
        await this._dbTestManager.createTable(this._dbConnection, model.tableName, tableGeneratorColumnId, {
          sqlName: 'string',
        });
        const entity = { id: 2, name: 'Just a name' };
        const manager = this._secondaryEntityManagerGenerator(model, this._dbConnection);
        await manager.insert(entity);

        const entitiesFound = await manager.getByIds([entity.id]);
        expect(entitiesFound).toContain(entity);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustInsertAnEntity(): void {
    const itsName = 'mustInsertAnEntity';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = namedModelGenerator({ prefix: prefix });
        const entity: NamedEntityTest = { id: 0, name: 'name' };
        await this._dbTestManager.createTable(
          this._dbConnection,
          model.tableName,
          tableGeneratorColumnId,
          tableGeneratorOtherColumns,
        );
        const secondaryEntityManager = this._secondaryEntityManagerGenerator<NamedEntityTest>(
          model,
          this._dbConnection,
        );
        await secondaryEntityManager.insert(entity);
        const insertedEntity = await secondaryEntityManager.getById(entity.id);
        expect({ ...insertedEntity }).toEqual(entity);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustInsertAnEntityWithAutoIncrementStrategy(): void {
    const itsName = 'mustInsertAnEntityWithAutoIncrementStrategy';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = namedModelGenerator({ prefix: prefix }, true);
        const entity: NamedEntityTest = { id: undefined, name: 'name' };
        await this._dbTestManager.createTable(
          this._dbConnection,
          model.tableName,
          { name: 'id', type: 'increments' },
          tableGeneratorOtherColumns,
        );
        const secondaryEntityManager = this._secondaryEntityManagerGenerator<NamedEntityTest>(
          model,
          this._dbConnection,
        );
        await secondaryEntityManager.insert(entity);
        const entityFound = await secondaryEntityManager.getById(entity.id);
        expect(entityFound.id).not.toBeUndefined();
        expect(entityFound.id).not.toBeNull();
        expect(entityFound.name).toBe(entity.name);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustInsertMultieplEntities(): void {
    const itsName = 'mustInsertMultieplEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = namedModelGenerator({ prefix: prefix });
        const entity: NamedEntityTest = { id: 0, name: 'name' };
        await this._dbTestManager.createTable(
          this._dbConnection,
          model.tableName,
          tableGeneratorColumnId,
          tableGeneratorOtherColumns,
        );
        const secondaryEntityManager = this._secondaryEntityManagerGenerator<NamedEntityTest>(
          model,
          this._dbConnection,
        );
        await secondaryEntityManager.mInsert([entity]);
        const insertedEntity = await secondaryEntityManager.getById(entity.id);
        expect({ ...insertedEntity }).toEqual(entity);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustInsertMultipleEntitiesWithAutoIncrementStrategy(): void {
    const itsName = 'mustInsertMultipleEntitiesWithAutoIncrementStrategy';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = namedModelGenerator({ prefix: prefix }, true);
        const entity: NamedEntityTest = { id: undefined, name: 'name' };
        const entity2: NamedEntityTest = { id: undefined, name: 'name2' };
        await this._dbTestManager.createTable(
          this._dbConnection,
          model.tableName,
          { name: 'id', type: 'increments' },
          tableGeneratorOtherColumns,
        );
        const secondaryEntityManager = this._secondaryEntityManagerGenerator<NamedEntityTest>(
          model,
          this._dbConnection,
        );
        await secondaryEntityManager.mInsert([entity, entity2]);
        const entityFound = await secondaryEntityManager.getById(entity.id);
        const entityFound2 = await secondaryEntityManager.getById(entity2.id);
        expect(typeof entityFound.id).toBe('number');
        expect(entityFound.name).toBe(entity.name);
        expect(typeof entityFound2.id).toBe('number');
        expect(entityFound2.name).toBe(entity2.name);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustInsertZeroEntities(): void {
    const itsName = 'mustInsertZeroEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = namedModelGenerator({ prefix: prefix });
        await this._dbTestManager.createTable(
          this._dbConnection,
          model.tableName,
          tableGeneratorColumnId,
          tableGeneratorOtherColumns,
        );
        const secondaryEntityManager = this._secondaryEntityManagerGenerator<NamedEntityTest>(
          model,
          this._dbConnection,
        );

        expectAsync(secondaryEntityManager.mInsert(new Array())).toBeResolved();

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustUpdateAnEntity(): void {
    const itsName = 'mustUpdateAnEntity';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = namedModelGenerator({ prefix: prefix });
        const entity: NamedEntityTest = { id: 0, name: 'name' };
        const entityAfter: NamedEntityTest = { id: 0, name: 'nameAfter' };
        await this._dbTestManager.createTable(
          this._dbConnection,
          model.tableName,
          tableGeneratorColumnId,
          tableGeneratorOtherColumns,
        );
        await this._dbTestManager.insert(this._dbConnection, model.tableName, entity);
        const secondaryEntityManager = this._secondaryEntityManagerGenerator<NamedEntityTest>(
          model,
          this._dbConnection,
        );
        await secondaryEntityManager.update(entityAfter);
        const entityUpdated = await secondaryEntityManager.getById(entity.id);
        expect({ ...entityUpdated }).toEqual(entityAfter);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustUpdateMultipleEntities(): void {
    const itsName = 'mustUpdateMultipleEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = namedModelGenerator({ prefix: prefix });
        const entity: NamedEntityTest = { id: 0, name: 'name' };
        const entityAfter: NamedEntityTest = { id: 0, name: 'nameAfter' };
        await this._dbTestManager.createTable(
          this._dbConnection,
          model.tableName,
          tableGeneratorColumnId,
          tableGeneratorOtherColumns,
        );
        await this._dbTestManager.insert(this._dbConnection, model.tableName, entity);
        const secondaryEntityManager = this._secondaryEntityManagerGenerator<NamedEntityTest>(
          model,
          this._dbConnection,
        );
        await secondaryEntityManager.mUpdate([entityAfter]);
        const updatedEntity = await secondaryEntityManager.getById(entity.id);
        expect({ ...updatedEntity }).toEqual(entityAfter);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustUpdateZeroEntities(): void {
    const itsName = 'mustUpdateZeroEntities';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        await this._beforeAllPromise;

        const model = namedModelGenerator({ prefix: prefix });
        await this._dbTestManager.createTable(
          this._dbConnection,
          model.tableName,
          tableGeneratorColumnId,
          tableGeneratorOtherColumns,
        );
        const secondaryEntityManager = this._secondaryEntityManagerGenerator<NamedEntityTest>(
          model,
          this._dbConnection,
        );

        expectAsync(secondaryEntityManager.mUpdate(new Array())).toBeResolved();

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }
}
