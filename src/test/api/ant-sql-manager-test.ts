import { AntSqlManager } from '../../api/ant-sql-manager';
import { AntSqlManagerForTest } from './ant-manager-for-test';
import { AntSqlModelManager } from '../../api/ant-sql-model-manager';
import { AntSqlModelManagerForTest } from './ant-sql-model-manager-for-test';
import { ApiSqlModel } from '../../api/api-sql-model';
import { Entity } from '@antjs/ant-js';
import { SqlType } from '../../model/sql-type';
import { Test } from '@antjs/ant-js/build/testapi/api/test';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

const modelTestGen = (prefix: string): ApiSqlModel => {
  return {
    columns: [
      {
        entityAlias: 'id',
        sqlName: 'id',
        type: SqlType.Integer,
      },
    ],
    id: 'id',
    keyGen: { prefix },
    tableName: prefix.replace(/\//g, '_'),
  };
};

export class AntSqlManagerTest implements Test {
  /**
   * Declare name for the test
   */
  protected _declareName: string;

  public constructor() {
    this._declareName = 'AntSqlManagerTest';
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustGenerateAnAntModelManager();
      this._itMustNotRegisterTwoModelsWithTheSameAlias();
      this._itMustRegisterAModelWithPendingRefAndResolveThemLater();
      this._itMustRegisterAModelWithRefAliasAndResolveIt();
    });
  }

  private _itMustGenerateAnAntModelManager(): void {
    const itsName = 'mustGenerateAnAntModelManager';
    const prefix = this._declareName + '/' + itsName + '/';
    it(
      itsName,
      async (done) => {
        const model = modelTestGen(prefix);
        const manager = new AntSqlManager();
        const antModelManager = manager.get(model);
        expect(antModelManager instanceof AntSqlModelManager).toBe(true);
        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustNotRegisterTwoModelsWithTheSameAlias(): void {
    it(
      'must not register two models with the same alias',
      async (done) => {
        const alias = 'ref-alias';
        const refModel: ApiSqlModel = {
          alias,
          columns: [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          id: 'id',
          keyGen: { prefix: 'someRefPrefix' },
          tableName: 'RefModelSqlTableName',
        };
        const refModel2: ApiSqlModel = {
          alias,
          columns: [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          id: 'id',
          keyGen: { prefix: 'someRefPrefix2' },
          tableName: 'RefModelSqlTableName2',
        };
        const manager = new AntSqlManagerForTest();
        manager.get(refModel);
        expect(() => manager.get(refModel2)).toThrowError();

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustRegisterAModelWithPendingRefAndResolveThemLater(): void {
    it(
      'must register a model with pending model references and resolve them later',
      async (done) => {
        const refTableName = 'RefModelSqlTableName';
        const tableName = 'ModelSqlTableName';
        const refModel: ApiSqlModel = {
          alias: 'ref-alias',
          columns: [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          id: 'id',
          keyGen: { prefix: 'someRefPrefix' },
          tableName: refTableName,
        };
        const referenceColumnAlias = 'reference';
        const model: ApiSqlModel = {
          columns: [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
            {
              entityAlias: 'number',
              sqlName: 'number',
              type: SqlType.Integer,
            },
            {
              entityAlias: referenceColumnAlias,
              refAlias: refModel.alias,
              sqlName: 'reference',
              type: SqlType.Integer,
            },
          ],
          id: 'id',
          keyGen: { prefix: 'somePrefix' },
          tableName,
        };

        const manager = new AntSqlManagerForTest();

        const innerRefColumn = (manager.get(model) as AntSqlModelManagerForTest<Entity>).model.columnByAlias(
          referenceColumnAlias,
        );

        manager.get(refModel);

        const innerRefModel = innerRefColumn.refModel;

        expect(innerRefModel).not.toBeUndefined();
        expect(innerRefModel).not.toBeNull();
        expect(innerRefModel.alias).toBe(refModel.alias);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }

  private _itMustRegisterAModelWithRefAliasAndResolveIt(): void {
    it(
      'must register a model with alias in order to be referenced and resolve it',
      async (done) => {
        const refTableName = 'RefModelSqlTableName';
        const tableName = 'ModelSqlTableName';
        const refModel: ApiSqlModel = {
          alias: 'ref-alias',
          columns: [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
          ],
          id: 'id',
          keyGen: { prefix: 'someRefPrefix' },
          tableName: refTableName,
        };
        const referenceColumnAlias = 'reference';
        const model: ApiSqlModel = {
          columns: [
            {
              entityAlias: 'id',
              sqlName: 'id',
              type: SqlType.Integer,
            },
            {
              entityAlias: 'number',
              sqlName: 'number',
              type: SqlType.Integer,
            },
            {
              entityAlias: referenceColumnAlias,
              refAlias: refModel.alias,
              sqlName: 'reference',
              type: SqlType.Integer,
            },
          ],
          id: 'id',
          keyGen: { prefix: 'somePrefix' },
          tableName,
        };

        const manager = new AntSqlManagerForTest();
        manager.get(refModel);

        const innerRefModel = (manager.get(model) as AntSqlModelManagerForTest<Entity>).model.columnByAlias(
          referenceColumnAlias,
        ).refModel;

        expect(innerRefModel).not.toBeUndefined();
        expect(innerRefModel).not.toBeNull();
        expect(innerRefModel.alias).toBe(refModel.alias);

        done();
      },
      MAX_SAFE_TIMEOUT,
    );
  }
}
