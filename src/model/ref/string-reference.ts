import { Entity } from '@antjs/ant-js';
import { Reference } from './reference';

export interface StrRef<TEntity extends Entity> extends Reference<TEntity, string> {}
