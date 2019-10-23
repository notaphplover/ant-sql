import { Entity } from '@antjs/ant-js';
import { AntModelManager } from '@antjs/ant-js/src/api/ant-model-manager';
import { SqlModel } from '../model/sql-model';
import { ISqlModelManager } from '../persistence/primary/ISqlModelManager';
import { IAntSqlUpdateOptions } from '../persistence/primary/options/IAntSqlUpdateOptions';
import { SqlModelManager } from '../persistence/primary/SqlModelManager';
import { AntMySqlSecondaryEntityManager } from '../persistence/secondary/AntMySqlSecondaryEntityManager';
import { AntSQLiteSecondaryEntityManager } from '../persistence/secondary/AntSQLiteSecondaryEntityManager';
import { AntSqlSecondaryEntityManager } from '../persistence/secondary/AntSqlSecondaryEntityManager';
import { ISqlSecondaryEntityManager } from '../persistence/secondary/ISqlSecondaryEntityManager';
import { KnexDriver } from '../persistence/secondary/KnexDriver';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { QueryConfigFactory } from './config/query-config-factory';
import { ApiSqlModelManager } from './api-sql-model-manager';

export class AntSqlModelManager<TEntity extends Entity>
  extends AntModelManager<TEntity, ApiSqlModelConfig, SqlModel, ISqlModelManager<TEntity>>
  implements ApiSqlModelManager<TEntity> {
  /**
   * Query config factory.
   */
  protected _queryConfigFactory: QueryConfigFactory<TEntity>;

  /**
   * Gets the query config factory.
   * @returns query config factory.
   */
  public get cfgGen(): QueryConfigFactory<TEntity> {
    if (!this._queryConfigFactory) {
      throw new Error(
        `The current action could not be performed because the model manager is not ready.
This is probably caused by the absence of a config instance. Ensure that config is set.`,
      );
    }

    return this._queryConfigFactory;
  }

  /**
   * Gets the current AntJS model config.
   * @returns Current AntJS model config.
   */
  public config(): ApiSqlModelConfig;
  /**
   * Sets the current AntJS model config.
   * @param config new AntJS model config.
   * @returns this instance.
   */
  public config(config: ApiSqlModelConfig): this;
  public config(config?: ApiSqlModelConfig): ApiSqlModelConfig | this {
    if (undefined !== config && !this._config) {
      this._queryConfigFactory = new QueryConfigFactory(config.knex, this._model);
    }
    return super.config(config);
  }

  /**
   * Inserts an entity.
   * @param entity Entity to be inserted.
   * @param options Persistency options.
   * @returns Promise of entity inserted.
   */
  public insert(entity: TEntity, options?: IAntSqlUpdateOptions): Promise<any> {
    return this.modelManager.insert(entity, options);
  }

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @param options Persistency options.
   * @returns Promise of entities inserted.
   */
  public mInsert(entities: TEntity[], options?: IAntSqlUpdateOptions): Promise<any> {
    return this.modelManager.mInsert(entities, options);
  }

  /**
   * Generates a model manager.
   * @param model Model to manage.
   * @param config AntSQL Model config.
   * @returns Model manager generated.
   */
  protected _generateModelManager(model: SqlModel, config: ApiSqlModelConfig): ISqlModelManager<TEntity> {
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
    model: SqlModel,
    config: ApiSqlModelConfig,
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
