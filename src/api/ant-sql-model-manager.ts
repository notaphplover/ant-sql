import { Entity, PersistencyUpdateOptions } from '@antjs/ant-js';
import { AntModelManager } from '@antjs/ant-js/build/api/ant-model-manager';
import { AntPrimaryModelManager } from '@antjs/ant-js/build/persistence/primary/ant-primary-model-manager';
import { AntSqlReference } from '../model/ref/ant-sql-reference';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { ApiSqlModelManager } from './api-sql-model-manager';
import { KnexDriver } from '../persistence/secondary/knex-driver';
import { MSSqlSecondaryEntityManager } from '../persistence/secondary/mssql-secondary-entity-manager';
import { MySqlSecondaryEntityManager } from '../persistence/secondary/mysql-secondary-entity-manager';
import { PrimaryModelManager } from '@antjs/ant-js/build/persistence/primary/primary-model-manager';
import { QueryConfigFactory } from './config/query-config-factory';
import { SchedulerModelManager } from '../persistence/scheduler/scheduler-model-manager';
import { SecondaryEntityManager } from '../persistence/secondary/secondary-entity-manager';
import { SqLiteSecondaryEntityManager } from '../persistence/secondary/sqlite-secondary-entity-manager';
import { SqlModel } from '../model/sql-model';
import { SqlReference } from '../ant';
import { SqlSchedulerModelManager } from '../persistence/scheduler/sql-scheduler-model-manager';
import { SqlSecondaryEntityManager } from '../persistence/secondary/sql-secondary-entity-manager';

export class AntSqlModelManager<TEntity extends Entity>
  extends AntModelManager<TEntity, ApiSqlModelConfig, SqlModel<TEntity>, SchedulerModelManager<TEntity>>
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
   * @inheritdoc
   */
  public getReference<TId extends number | string>(id: TId): SqlReference<TEntity, TId> {
    return new AntSqlReference(id, this._model);
  }

  /**
   * @inheritdoc
   */
  public insert(entity: TEntity, options?: Partial<PersistencyUpdateOptions>): Promise<any> {
    return this.scheduledManager.insert(entity, options);
  }

  /**
   * @inheritdoc
   */
  public mInsert(entities: TEntity[], options?: Partial<PersistencyUpdateOptions>): Promise<any> {
    return this.scheduledManager.mInsert(entities, options);
  }

  /**
   * @inheritdoc
   */
  public mUpdate(entities: TEntity[], options?: Partial<PersistencyUpdateOptions>): Promise<any> {
    return this.scheduledManager.mUpdate(entities, options);
  }

  /**
   * @inheritdoc
   */
  public update(entity: TEntity, options?: Partial<PersistencyUpdateOptions>): Promise<any> {
    return this.scheduledManager.update(entity, options);
  }

  /**
   * Generates a model manager.
   * @param model Model to manage.
   * @param config AntSQL Model config.
   * @returns Model manager generated.
   */
  protected _generatePrimaryManager(
    model: SqlModel<TEntity>,
    config: ApiSqlModelConfig,
    secondaryManager: SecondaryEntityManager<TEntity>,
  ): PrimaryModelManager<TEntity> {
    return new AntPrimaryModelManager<TEntity, SecondaryEntityManager<TEntity>>(
      model,
      config.redis,
      config.negativeCache ?? true,
      secondaryManager,
    );
  }

  /**
   * Generates a new scheduled manager.
   * @param model Model of the manager.
   * @param config Manager config.
   * @returns Scheduled manager generated.
   */
  protected _generateScheduledManager(
    model: SqlModel<TEntity>,
    config: ApiSqlModelConfig,
  ): SchedulerModelManager<TEntity> {
    const secondaryManager = this._generateSecondaryManager(model, config);
    const primaryManager = this._generatePrimaryManager(model, config, secondaryManager);
    return new SqlSchedulerModelManager(model, primaryManager, secondaryManager);
  }

  /**
   * Generates a secondary model manager.
   * @param model Model to manage.
   * @param config AntSQL model config.
   * @returns Secondary model manager generated.
   */
  protected _generateSecondaryManager(
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
