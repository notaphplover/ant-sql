import { IEntity } from '@antjs/ant-js/src/model/IEntity';

export interface ICfgGenOptions<TEntity extends IEntity> {
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
