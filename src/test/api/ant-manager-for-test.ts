import { AntSqlManager } from '../../api/ant-sql-manager';
import { AntSqlModelManagerForTest } from './ant-sql-model-manager-for-test';
import { ApiSqlModel } from '../../api/api-sql-model';
import { ApiSqlModelManager } from '../../api/api-sql-model-manager';
import { Entity } from '@antjs/ant-js';

export class AntSqlManagerForTest extends AntSqlManager {
  /**
   * Creates a model manager.
   * @param model Model to manage.
   * @returns model manager created.
   */
  protected _createModelManager<TEntity extends Entity>(model: ApiSqlModel): ApiSqlModelManager<TEntity> {
    return new AntSqlModelManagerForTest<TEntity>(this._createModel<TEntity>(model));
  }
}
