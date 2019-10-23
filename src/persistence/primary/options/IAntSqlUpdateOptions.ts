import { PersistencyUpdateOptions } from '@antjs/ant-js/src/persistence/primary/options/persistency-update-options';
import { ISqlServerOptions } from './ISqlServerOptions';

export interface IAntSqlUpdateOptions
  extends PersistencyUpdateOptions, ISqlServerOptions {}
