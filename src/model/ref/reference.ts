import { Entity } from '@antjs/ant-js';

export interface Reference<TEntity extends Entity, TId extends number | string> {
  /**
   * Reference id
   */
  id: TId;
  /**
   * Reference entity
   */
  entity: TEntity;
}
