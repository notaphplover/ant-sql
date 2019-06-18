import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import * as Knex from 'Knex';
import { IAntSQLColumn } from '../../model/IAntSQLColumn';
import { IAntSqlModel } from '../../model/IAntSqlModel';

export class SecondaryEntityManagerHelper<TEntity extends IEntity> {
  /**
   * DB Connection.
   */
  protected _dbConnection: Knex;
  /**
   * Model to manage.
   */
  protected _model: IAntSqlModel;

  /**
   * Creates a new secondary entity manager helper.
   * @param model Model to manage.
   * @param dbConnection Knex DB Connection.
   */
  public constructor(model: IAntSqlModel, dbConnection: Knex) {
    this._dbConnection = dbConnection;
    this._model = model;
  }

  /**
   * Builds a Knex object that is equivalent of an entity.
   * @param model Model of the entity to process.
   * @param entity Entity to use in the build.
   */
  public buildKnexObject(model: IAntSqlModel, entity: TEntity): {[key: string]: any} {
    const updateObject: {[key: string]: any} = {};
    for (const [, columnData] of model.columns) {
      const entityValue = entity[columnData.entityAlias];
      if (undefined !== entityValue) {
        updateObject[columnData.sqlName] = entityValue;
      }
    }
    return updateObject;
  }

  public mInsertOnAutoincrementWithNoMultipleReturning(
    entities: TEntity[],
    autoGeneratedColumn: IAntSQLColumn,
  ): Promise<any> {
    if (0 === entities.length) {
      return new Promise((resolve) => resolve());
    }
    return this
      ._dbConnection
      .transaction((transaction) => {
        const queries = new Array<Knex.QueryBuilder>();
        for (const entity of entities) {
          queries.push(
            this
              ._dbConnection
              .returning(autoGeneratedColumn.sqlName)
              .insert(this.buildKnexObject(this._model, entity))
              .into(this._model.tableName)
              .transacting(transaction),
          );
        }
        Promise.all(queries)
          .then((values) => {
            return transaction.commit().then(() => {
              for (let i = 0; i < entities.length; ++i) {
                if (null != values[i]) {
                  (entities[i] as IEntity)[autoGeneratedColumn.entityAlias] = values[i];
                }
              }
            });
          })
          .catch(transaction.rollback);
      });
  }
}
