import { Entity } from '@antjs/ant-js';

export interface ICfgGenOptions<TEntity extends Entity> {
  /**
   * Entity key generator.
   */
  entityKeyGen?: (entity: TEntity) => string;
  /**
   * Query key generator.
   */
  queryKeyGen?: (params: any) => string;
  /**
   * Reverse hash key.
   */
  reverseHashKey?: string;
}
