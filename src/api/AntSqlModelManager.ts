import { AntModelManager } from '@antjs/ant-js/src/api/AntModelManager';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { ICacheOptions } from '@antjs/ant-js/src/persistence/primary/options/ICacheOptions';
import { IAntSqlModel } from '../model/IAntSqlModel';
import { ISqlModelManager } from '../persistence/primary/ISqlModelManager';
import { SqlModelManager } from '../persistence/primary/SqlModelManager';
import { AntMySqlSecondaryEntityManager } from '../persistence/secondary/AntMySqlSecondaryEntityManager';
import { AntSQLiteSecondaryEntityManager } from '../persistence/secondary/AntSQLiteSecondaryEntityManager';
import { AntSqlSecondaryEntityManager } from '../persistence/secondary/AntSqlSecondaryEntityManager';
import { ISqlSecondaryEntityManager } from '../persistence/secondary/ISqlSecondaryEntityManager';
import { KnexDriver } from '../persistence/secondary/KnexDriver';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';
import { IAntSqlModelManager } from './IAntSqlModelManager';

export class AntSqlModelManager<TEntity extends IEntity>
  extends AntModelManager<
    TEntity,
    IAntSqlModelConfig,
    IAntSqlModel,
    ISqlModelManager<TEntity>
> implements IAntSqlModelManager<TEntity> {

  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @returns Promise of entity inserted.
   */
  public insert(entity: TEntity, cacheOptions?: ICacheOptions): Promise<any> {
    return this.modelManager.insert(entity, cacheOptions);
  }

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @returns Promise of entities inserted.
   */
  public mInsert(entities: TEntity[], cacheOptions?: ICacheOptions): Promise<any> {
    return this.modelManager.mInsert(entities, cacheOptions);
  }

  /**
   * Generates a model manager.
   * @param model Model to manage.
   * @param config AntSQL Model config.
   * @returns Model manager generated.
   */
  protected _generateModelManager(
    model: IAntSqlModel,
    config: IAntSqlModelConfig,
  ): ISqlModelManager<TEntity> {
    return new SqlModelManager<TEntity>(
      model,
      config.redis,
      config.negativeCache || true,
      this._generateSecondaryEntityManager(model, config),
    );
  }

  /**
   * Generates a secondary model manager.
   * @param model Model to manage.
   * @param config AntSQL model config.
   * @returns Secondary model manager generated.
   */
  protected _generateSecondaryEntityManager(
    model: IAntSqlModel,
    config: IAntSqlModelConfig,
  ): ISqlSecondaryEntityManager<TEntity> {
    const knex = config.knex;

    switch (knex.client.driverName) {
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        return new AntMySqlSecondaryEntityManager(model, knex);
      case KnexDriver.SQLITE3:
        return new AntSQLiteSecondaryEntityManager(model, knex);
      default:
        return new AntSqlSecondaryEntityManager(model, knex);
    }
  }
}
