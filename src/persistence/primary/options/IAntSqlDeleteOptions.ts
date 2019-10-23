import { PersistencyDeleteOptions } from '@antjs/ant-js/src/persistence/primary/options/persistency-delete-options';
import { ISqlServerOptions } from './ISqlServerOptions';

export interface IAntSqlDeleteOptions
  extends PersistencyDeleteOptions, ISqlServerOptions {}
