import { Entity } from '@antjs/ant-js';

export interface SqlReference<TEntity extends Entity, TId extends number | string> {
  /**
   * Reference id
   */
  id: TId;
  /**
   * Reference entity
   */
  entity: TEntity;
}
