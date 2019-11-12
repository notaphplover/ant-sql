import { Entity } from '@antjs/ant-js';
import { Reference } from './reference';

export interface NumRef<TEntity extends Entity> extends Reference<TEntity, number> {}
