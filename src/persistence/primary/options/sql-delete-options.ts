import { PersistencyDeleteOptions } from '@antjs/ant-js';
import { SqlServerOptions } from './sql-server-options';

export interface SqlDeleteOptions extends PersistencyDeleteOptions, SqlServerOptions {}
