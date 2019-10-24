import { Entity } from '@antjs/ant-js';

export interface ApiCfgGenOptions<TEntity extends Entity> {
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
