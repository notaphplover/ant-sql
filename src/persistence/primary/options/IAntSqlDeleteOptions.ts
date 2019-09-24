import { IPersistencyDeleteOptions } from '@antjs/ant-js/src/persistence/primary/options/IPersistencyDeleteOptions';
import { ISqlServerOptions } from './ISqlServerOptions';

export interface IAntSqlDeleteOptions
  extends IPersistencyDeleteOptions, ISqlServerOptions {}
