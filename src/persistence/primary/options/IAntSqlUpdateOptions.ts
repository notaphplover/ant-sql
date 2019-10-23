import { PersistencyUpdateOptions } from '@antjs/ant-js';
import { ISqlServerOptions } from './ISqlServerOptions';

export interface IAntSqlUpdateOptions
  extends PersistencyUpdateOptions, ISqlServerOptions {}
