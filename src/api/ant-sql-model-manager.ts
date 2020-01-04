import { AntModelManager } from '@antjs/ant-js/build/api/ant-model-manager';
import { AntSqlPrimaryModelManager } from '../persistence/primary/ant-sql-primary-model-manager';
import { AntSqlReference } from '../model/ref/ant-sql-reference';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { ApiSqlModelManager } from './api-sql-model-manager';
import { Entity } from '@antjs/ant-js';
import { KnexDriver } from '../persistence/secondary/knex-driver';
import { MSSqlSecondaryEntityManager } from '../persistence/secondary/mssql-secondary-entity-manager';
import { MySqlSecondaryEntityManager } from '../persistence/secondary/mysql-secondary-entity-manager';
import { QueryConfigFactory } from './config/query-config-factory';
import { SecondaryEntityManager } from '../persistence/secondary/secondary-entity-manager';
import { SqLiteSecondaryEntityManager } from '../persistence/secondary/sqlite-secondary-entity-manager';
import { SqlModel } from '../model/sql-model';
import { SqlPrimaryModelManager } from '../persistence/primary/sql-primary-model-manager';
import { SqlReference } from '../ant';
import { SqlSecondaryEntityManager } from '../persistence/secondary/sql-secondary-entity-manager';
import { SqlUpdateOptions } from '../persistence/primary/options/sql-update-options';

export class AntSqlModelManager<TEntity extends Entity>
  extends AntModelManager<TEntity, ApiSqlModelConfig, SqlModel<TEntity>, SqlPrimaryModelManager<TEntity>>
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
  public insert(entity: TEntity, options?: SqlUpdateOptions): Promise<any> {
    return this.modelManager.insert(entity, options);
  }

  /**
   * Inserts multiple entities.
   * @param entities Entities to be inserted.
   * @param options Persistency options.
   * @returns Promise of entities inserted.
   */
  public mInsert(entities: TEntity[], options?: SqlUpdateOptions): Promise<any> {
    return this.modelManager.mInsert(entities, options);
  }

  /**
   * Creates a reference from an entity id.
   * @param id Reference's id.
   */
  public getReference<TId extends number | string>(id: TId): SqlReference<TEntity, TId> {
    return new AntSqlReference(id, this._model);
  }

  /**
   * Generates a model manager.
   * @param model Model to manage.
   * @param config AntSQL Model config.
   * @returns Model manager generated.
   */
  protected _generateModelManager(
    model: SqlModel<TEntity>,
    config: ApiSqlModelConfig,
  ): SqlPrimaryModelManager<TEntity> {
    return new AntSqlPrimaryModelManager<TEntity>(
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
    model: SqlModel<TEntity>,
    config: ApiSqlModelConfig,
  ): SecondaryEntityManager<TEntity> {
    const knex = config.knex;

    switch (knex.client.driverName) {
      case KnexDriver.MSSQL:
        return new MSSqlSecondaryEntityManager(model, knex);
      case KnexDriver.MYSQL:
      case KnexDriver.MYSQL2:
        return new MySqlSecondaryEntityManager(model, knex);
      case KnexDriver.SQLITE3:
        return new SqLiteSecondaryEntityManager(model, knex);
      default:
        return new SqlSecondaryEntityManager(model, knex);
    }
  }
}
