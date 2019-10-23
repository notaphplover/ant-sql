import { ApiModelManager } from '@antjs/ant-js/src/api/api-model-manager';
import { Entity } from '@antjs/ant-js';
import { ISqlInsertable } from '../persistence/primary/ISqlInsertable';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';
import { QueryConfigFactory } from './config/QueryConfigFactory';

export interface IAntSqlModelManager<TEntity extends Entity>
  extends ApiModelManager<TEntity, IAntSqlModelConfig>, ISqlInsertable<TEntity> {

    /**
     * Gets the query config factory.
     * @returns query config factory.
     */
    cfgGen: QueryConfigFactory<TEntity>;
  }
