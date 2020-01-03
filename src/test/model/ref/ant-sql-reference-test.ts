import { AntSqlModel } from '../../../model/ant-sql-model';
import { AntSqlReference } from '../../../model/ref/ant-sql-reference';
import { Entity } from '@antjs/ant-js';
import { SqlModel } from '../../../model/sql-model';
import { SqlType } from '../../../model/sql-type';
import { Test } from '@antjs/ant-js/build/testapi/api/test';

const MAX_SAFE_TIMEOUT = Math.pow(2, 31) - 1;

export class AntSqlReferenceTest implements Test {
  /**
   * Declare name for the test
   */
  protected _declareName: string;

  /**
   * Model used for tests
   */
  protected _modelForTests: SqlModel<Entity>;

  public constructor() {
    this._declareName = AntSqlReferenceTest.name;
    this._modelForTests = new AntSqlModel(
      'id',
      { prefix: 'somePrefix' },
      [
        {
          entityAlias: 'id',
          sqlName: 'id',
          type: SqlType.Integer,
        },
      ],
      'ModelSqlTableName',
    );
  }

  public performTests(): void {
    describe(this._declareName, () => {
      this._itMustBeInitializable();
      this._itMustNotSetANullEntity();
      this._itMustSetAnEntityAndChangeTheStoredId();
      this._itMustSetAnIdAndRemoveTheStoredEntity();
      this._itMustStoreInitialValues();
    });
  }

  private _itMustBeInitializable(): void {
    const itsName = 'must be initializable';
    it(itsName, async(done) => {
      expect(() => new AntSqlReference(0, this._modelForTests));
      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustNotSetANullEntity(): void {
    it('must not set a null entity', async(done) => {
      const id = 0;
      const ref = new AntSqlReference(id, this._modelForTests);

      expect(() => { ref.entity = null; }).toThrowError();
      expect(() => { ref.entity = undefined; }).toThrowError();

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustSetAnEntityAndChangeTheStoredId(): void {
    it('must set an entity and change the stored id', async(done) => {
      const id = 0;
      const ref = new AntSqlReference(id, this._modelForTests);
      const entity: Entity = { id: 1 };
      ref.entity = entity;

      expect(ref.id).toBe(entity.id);
      expect(ref.entity).toBe(entity);

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustSetAnIdAndRemoveTheStoredEntity(): void {
    it('must set an id and remove the stored entity', async(done) => {
      const id = 0;
      const ref = new AntSqlReference(id, this._modelForTests);
      const entity: Entity = { id: 1 };
      ref.entity = entity;

      ref.id = id;

      expect(ref.id).toBe(id);
      expect(ref.entity).toBeNull();

      done();
    }, MAX_SAFE_TIMEOUT);
  }

  private _itMustStoreInitialValues(): void {
    const itsName = 'must store initial values';
    it(itsName, async(done) => {
      const id = 0;
      const ref = new AntSqlReference(id, this._modelForTests);

      expect(ref.id).toBe(id);
      expect(ref.entity).toBeNull();

      done();
    }, MAX_SAFE_TIMEOUT);
  }
}
