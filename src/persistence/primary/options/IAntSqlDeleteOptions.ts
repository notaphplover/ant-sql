import { PersistencyDeleteOptions } from '@antjs/ant-js';
import { ISqlServerOptions } from './ISqlServerOptions';

export interface IAntSqlDeleteOptions
  extends PersistencyDeleteOptions, ISqlServerOptions {}
