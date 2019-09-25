import { IPersistencyUpdateOptions } from '@antjs/ant-js/src/persistence/primary/options/IPersistencyUpdateOptions';
import { ISqlServerOptions } from './ISqlServerOptions';

export interface IAntSqlUpdateOptions
  extends IPersistencyUpdateOptions, ISqlServerOptions {}
