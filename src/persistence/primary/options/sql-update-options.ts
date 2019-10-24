import { PersistencyUpdateOptions } from '@antjs/ant-js';
import { SqlServerOptions } from './sql-server-options';

export interface SqlUpdateOptions extends PersistencyUpdateOptions, SqlServerOptions {}
