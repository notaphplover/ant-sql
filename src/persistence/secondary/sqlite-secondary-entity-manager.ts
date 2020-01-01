import * as Knex from 'knex';
import { Entity } from '@antjs/ant-js';
import { SecondaryEntityManagerHelper } from './seconday-entity-manager-helper';
import { SqlModel } from '../../model/sql-model';
import { SqlSecondaryEntityManager } from './sql-secondary-entity-manager';

export class SqLiteSecondaryEntityManager<TEntity extends Entity> extends SqlSecondaryEntityManager<TEntity> {

  /**
   * Secondary entity manager helper.
   */
  protected _helper: SecondaryEntityManagerHelper<TEntity>;

  public constructor(model: SqlModel<TEntity>, dbConnection: Knex) {
    super(model, dbConnection);

    this._helper = new SecondaryEntityManagerHelper(model, dbConnection);
  }

  /**
   * @inheritdoc
   */
  public mInsert(entities: TEntity[]): Promise<any> {
    const autoGeneratedColumn = this.model.getAutoGeneratedColumn();
    if (null == autoGeneratedColumn) {
      return super.mInsert(entities);
    } else {
      return this._helper.mInsertOnAutoincrementWithNoMultipleReturning(entities, autoGeneratedColumn);
    }
  }
}
