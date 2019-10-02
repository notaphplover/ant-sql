import { IAntModelManager } from '@antjs/ant-js/src/api/IAntModelManager';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { ISqlInsertable } from '../persistence/primary/ISqlInsertable';
import { IAntSqlModelConfig } from './config/IAntSqlModelConfig';
import { QueryConfigFactory } from './config/QueryConfigFactory';

export interface IAntSqlModelManager<TEntity extends IEntity>
  extends IAntModelManager<TEntity, IAntSqlModelConfig>, ISqlInsertable<TEntity> {

    /**
     * Gets the query config factory.
     * @returns query config factory.
     */
    cfgGen: QueryConfigFactory<TEntity>;
  }
