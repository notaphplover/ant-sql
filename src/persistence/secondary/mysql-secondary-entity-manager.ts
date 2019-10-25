import { Entity } from '@antjs/ant-js';
import { SqlSecondaryEntityManager } from './sql-secondary-entity-manager';

export class MySqlSecondaryEntityManager<TEntity extends Entity> extends SqlSecondaryEntityManager<TEntity> {
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
