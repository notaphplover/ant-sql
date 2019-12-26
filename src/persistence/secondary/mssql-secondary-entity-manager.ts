import { Entity } from '@antjs/ant-js';
import { SqlSecondaryEntityManager } from './sql-secondary-entity-manager';

export class MSSqlSecondaryEntityManager<TEntity extends Entity> extends SqlSecondaryEntityManager<TEntity> {
  /**
   * @inheritdoc
   */
  public mUpdate(entities: TEntity[]): Promise<any> {
    if (0 === entities.length) {
      return new Promise((resolve) => resolve());
    }
    /*
     * For now we need to await for queries in order to avoid the following error:
     *
     * TransactionError: Can't acquire connection for the request. There is another request in progress.
     *
     * We have plans to increase the performance of these queries.
     */
    return this._dbConnection.transaction(async (transaction) => {
      try {
        for (const entity of entities) {
          await this._dbConnection(this.model.tableName)
            .where(this.model.id, entity[this.model.id])
            .update(this._helper.buildKnexObject(this.model, entity))
            .transacting(transaction);
        }
        await transaction.commit();
      } catch (error) {
        await transaction.rollback(error);
      }
    });
  }
}
