import { AntManager } from '@antjs/ant-js/build/api/ant-manager';
import { AntSqlModel } from '../model/ant-sql-model';
import { AntSqlModelManager } from '../api/ant-sql-model-manager';
import { ApiSqlGeneralManager } from './api-sql-general-manager';
import { ApiSqlModel } from './api-sql-model';
import { ApiSqlModelConfig } from './config/api-sql-model-config';
import { ApiSqlModelManager } from './api-sql-model-manager';
import { Entity } from '@antjs/ant-js';
import { SqlColumn } from '../model/sql-column';
import { SqlModel } from '../model/sql-model';

export class AntSqlManager extends AntManager<ApiSqlModelConfig, ApiSqlModel, ApiSqlModelManager<Entity>>
  implements ApiSqlGeneralManager {

  /**
   * Model alias to model map.
   */
  protected _aliasToModelMap: Map<string, SqlModel<Entity>>
  /**
   * Model alias to not injected columns map.
   */
  protected _pendingColumnReferencesMap: Map<string, SqlColumn[]>

  /**
   * @inheritdoc
   */
  public constructor() {
    super();

    this._aliasToModelMap = new Map();
    this._pendingColumnReferencesMap = new Map();
  }

  /**
   * @inheritdoc
   */
  public get<TEntity extends Entity>(model: ApiSqlModel): ApiSqlModelManager<TEntity> {
    return super.get(model) as ApiSqlModelManager<TEntity>;
  }

  /**
   * Creates a model manager.
   * @param model Model to manage.
   * @returns model manager created.
   */
  protected _createModelManager<TEntity extends Entity>(model: ApiSqlModel): ApiSqlModelManager<TEntity> {
    const antModel = new AntSqlModel<TEntity>(model.id, model.keyGen, model.columns, model.tableName, model.alias);
    this._addModelToAvaiableModelRefs(antModel);
    this._processModel(antModel);
    return new AntSqlModelManager<TEntity>(antModel);
  }

  /**
   * Adds a model to the set of avaiable model refs and resolves any pending ref to that model.
   * @param model Model
   */
  private _addModelToAvaiableModelRefs<TEntity extends Entity>(model: AntSqlModel<TEntity>): void {
    if (model.alias) {
      this._aliasToModelMap.set(model.alias, model);
      const pendingRefs = this._pendingColumnReferencesMap.get(model.alias);
      if (undefined !== pendingRefs) {
        for(const pendingRef of pendingRefs) {
          pendingRef.refModel = model;
        }
      }
      this._pendingColumnReferencesMap.delete(model.alias);
    }
  }

  /**
   * Process a model in order to resolve model refs.
   * @param model Model to process.
   */
  private _processModel<TEntity extends Entity>(model: SqlModel<TEntity>): void {
    for (const column of model.columns) {
      this._processModelColumn(column);
    }
  }

  /**
   * Process model columns in order to resolve model refs.
   * @param column Column to process.
   */
  private _processModelColumn(column: SqlColumn): void {
    if (null != column.refAlias) {
      const modelFound = this._aliasToModelMap.get(column.refAlias);
      if (undefined === modelFound) {
        let pendingRefs = this._pendingColumnReferencesMap.get(column.refAlias);
        if (undefined === pendingRefs) {
          pendingRefs = new Array<SqlColumn>();
          this._pendingColumnReferencesMap.set(column.refAlias, pendingRefs);
        }
        pendingRefs.push(column);
      } else {
        column.refModel = modelFound;
      }
    }
  }
}
