import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { IKeyGenParams } from '@antjs/ant-js/src/model/IKeyGenParams';
import * as Knex from 'knex';
import { AntSqlManager } from '../../ant';
import { QueryConfigFactory } from '../../api/config/QueryConfigFactory';
import { ITest } from '../ITest';
import { modelGenerator } from '../model/AntSqlModelGenerator';
import { RedisWrapper } from '../persistence/primary/RedisWrapper';
import { DBTestManager } from '../persistence/secondary/DBTestManager';

const namedModelGenerator = (
  keyGen: IKeyGenParams,
  autoGeneratedId: boolean = false,
) => modelGenerator(keyGen, ['name'], autoGeneratedId ? 'id' : null);

const tableGeneratorColumnId: { name: string, type: 'number'|'string' }
  = { name: 'id', type: 'number' };

const tableGeneratorOtherColumns: { [key: string]: 'string' | 'number'; }
  = { name: 'string' };

type NamedEntityTest = {id: number, name: string} & IEntity;

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

export class QueryConfigFactoryTest implements ITest {
  /**
   * Before all promise.
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
   * Redis connection wrapper.
   */
  protected _redisWrapper: RedisWrapper;

  public constructor(
    beforeAllPromise: Promise<any>,
    dbConnection: Knex,
    dbAlias: string,
  ) {
    this._beforeAllPromise = beforeAllPromise;
    this._dbConnection = dbConnection;
    this._dbTestManager = new DBTestManager();
    this._declareName = QueryConfigFactoryTest.name + '/' + dbAlias;
    this._redisWrapper = new RedisWrapper();
  }

  /**
   * Performs all the tests.
   */
  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustBeInitializable();
      this._itMustBuildAnMqueryByFieldThatReturnsAnEmptyArrayIfAnEmptyParamsArrayIsProvided();
      this._itMustBuildAnMqueryByUniqueFieldThatReturnsAnEmptyArrayIfAnEmptyParamsArrayIsProvided();
      this._itMustBuildAQueryByFieldThatNeedsParameters();
      this._itMustBuildAQueryByUniqueFieldThatNeedsParameters();
      this._itMustBuildAQueryByUniqueFieldThatReturnsNullIfNoEntityIsFound();
      this._itMustBuildAValidQueryByFieldConfig();
      this._itMustBuildAValidQueryByUniqueFieldConfig();
    });
  }

  private _itMustBeInitializable(): void {
    it('It must be initializable', async (done) => {
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new QueryConfigFactory();
      });
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustBuildAnMqueryByFieldThatReturnsAnEmptyArrayIfAnEmptyParamsArrayIsProvided(): void {
    const itsName = 'It must build an query by field that returns an empty array if an empty params array is provided';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      await this._dbTestManager.createTable(
        this._dbConnection,
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );

      const factory = new QueryConfigFactory();
      const queryConfig = factory.getQueryByField<NamedEntityTest>(
        this._dbConnection, model, model.getColumn('name'), model.tableName + '/query/',
      );

      expect(await queryConfig.mQuery(new Array())).toEqual(new Array());
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustBuildAnMqueryByUniqueFieldThatReturnsAnEmptyArrayIfAnEmptyParamsArrayIsProvided(): void {
    const itsName =
      'It must build an query by unique field that returns an empty array if an empty params array is provided';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      await this._dbTestManager.createTable(
        this._dbConnection,
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );

      const factory = new QueryConfigFactory();
      const queryConfig = factory.getQueryByUniqueField<NamedEntityTest>(
        this._dbConnection, model, model.getColumn('name'), model.tableName + '/query/',
      );

      expect(await queryConfig.mQuery(new Array())).toEqual(new Array());
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustBuildAQueryByFieldThatNeedsParameters(): void {
    const itsName = 'It must build a query by field that needs parameters';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      await this._dbTestManager.createTable(
        this._dbConnection,
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );

      const factory = new QueryConfigFactory();
      const queryConfig = factory.getQueryByField<NamedEntityTest>(
        this._dbConnection, model, model.getColumn('name'), model.tableName + '/query/',
      );

      expect(() => queryConfig.query(null)).toThrowError();
      expect(() => queryConfig.query({})).toThrowError();
      expect(() => queryConfig.mQuery(null)).toThrowError();

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustBuildAQueryByUniqueFieldThatNeedsParameters(): void {
    const itsName = 'It must build a query by unique field that needs parameters';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      await this._dbTestManager.createTable(
        this._dbConnection,
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );

      const factory = new QueryConfigFactory();
      const queryConfig = factory.getQueryByUniqueField<NamedEntityTest>(
        this._dbConnection, model, model.getColumn('name'), model.tableName + '/query/',
      );

      expect(() => queryConfig.query(null)).toThrowError();
      expect(() => queryConfig.query({})).toThrowError();
      expect(() => queryConfig.mQuery(null)).toThrowError();

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustBuildAQueryByUniqueFieldThatReturnsNullIfNoEntityIsFound(): void {
    const itsName = 'It must build a query by unique field that returns null if no entity is found';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      await this._dbTestManager.createTable(
        this._dbConnection,
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );

      const factory = new QueryConfigFactory();
      const queryConfig = factory.getQueryByUniqueField<NamedEntityTest>(
        this._dbConnection, model, model.getColumn('name'), model.tableName + '/query-unique/',
      );

      const entityFound = await queryConfig.query({ name: 'name-1' });

      expect(entityFound).toBeNull();
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustBuildAValidQueryByFieldConfig(): void {
    const itsName = 'It must build a valid query by field config';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      await this._dbTestManager.createTable(
        this._dbConnection,
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );

      const antSqlManager = new AntSqlManager();
      const factory = new QueryConfigFactory();
      const modelManager = antSqlManager
        .get<NamedEntityTest>(model)
        .config({
          knex: this._dbConnection,
          redis: this._redisWrapper.redis,
        });
      const query = modelManager
        .query(
          factory.getQueryByField<NamedEntityTest>(
            this._dbConnection, model, model.getColumn('name'), model.tableName + '/query/',
          ),
        );

      const player1 = { id: 1, name: 'name-1' };
      const player2 = { id: 2, name: 'name-1' };
      const player3 = { id: 3, name: 'name-2' };
      const player4 = { id: 4, name: 'name-3' };

      await modelManager.mInsert([
        player1,
        player2,
        player3,
        player4,
      ]);

      const playersByName = await query.get({name: 'name-1'});
      const playersByNames = await query.mGet([
        {name: 'name-1'},
        {name: 'name-2'},
      ]);

      expect(playersByName).toContain(player1);
      expect(playersByName).toContain(player2);
      expect(playersByName).not.toContain(player3);
      expect(playersByName).not.toContain(player4);

      expect(playersByNames).toContain(player1);
      expect(playersByNames).toContain(player2);
      expect(playersByNames).toContain(player3);
      expect(playersByNames).not.toContain(player4);

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustBuildAValidQueryByUniqueFieldConfig(): void {
    const itsName = 'It must build a valid query by unique field config';
    const prefix = this._declareName + '/' + itsName + '/';
    it(itsName, async (done) => {
      await this._beforeAllPromise;

      const model = namedModelGenerator({ prefix: prefix });
      await this._dbTestManager.createTable(
        this._dbConnection,
        model.tableName,
        tableGeneratorColumnId,
        tableGeneratorOtherColumns,
      );

      const antSqlManager = new AntSqlManager();
      const factory = new QueryConfigFactory();
      const modelManager = antSqlManager
        .get<NamedEntityTest>(model)
        .config({
          knex: this._dbConnection,
          redis: this._redisWrapper.redis,
        });

      const player1 = { id: 1, name: 'name-1' };
      const player2 = { id: 2, name: 'name-2' };
      const player3 = { id: 3, name: 'name-3' };
      const player4 = { id: 4, name: 'name-4' };
      await modelManager.mInsert([
        player1,
        player2,
        player3,
        player4,
      ]);

      const query = modelManager
        .query(
          factory.getQueryByUniqueField<NamedEntityTest>(
            this._dbConnection, model, model.getColumn('name'), model.tableName + '/query-unique/',
          ),
        );

      const playerByName = await query.get({name: player1.name});
      const playersByNames = await query.mGet([
        {name: player1.name},
        {name: player2.name},
      ]);

      expect(playerByName).toEqual(player1);

      expect(playersByNames).toContain(player1);
      expect(playersByNames).toContain(player2);
      expect(playersByNames).not.toContain(player3);
      expect(playersByNames).not.toContain(player4);

      done();
    }, MAX_SAFE_TIMEOUT);
  }
}
