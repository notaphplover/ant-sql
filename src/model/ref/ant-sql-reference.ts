import { Entity } from '@antjs/ant-js';
import { Reference } from './reference';
import { SqlModel } from '../sql-model';

export class AntSqlReference<TEntity extends Entity, TId extends number | string> implements Reference<TEntity, TId> {
  /**
   * Entity referenced. If undefined, the entity may exists even if is's unknown.
   */
  protected _entity: TEntity;

  /**
   * Referenced entity's id.
   */
  protected _id: TId;

  /**
   * Referenced entity's model.
   */
  protected _model: SqlModel<TEntity>;

  /**
   * Creates a new reference.
   * @param id Referenced entity's id
   * @param model Referenced entity's model.
   */
  public constructor(id: TId, model: SqlModel<TEntity>) {
    this._model = model;
    this.id = id;
  }

  /**
   * Referenced entity's id.
   */
  public get id(): TId {
    return this._id;
  }

  /**
   * Referenced entity's id.
   */
  public set id(id: TId) {
    this._entity = null;
    this._id = id;
  }

  /**
   * Entity referenced. If undefined, the entity may exists even if is's unknown.
   */
  public get entity(): TEntity {
    return this._entity;
  }

  /**
   * Entity referenced. If undefined, the entity may exists even if is's unknown.
   */
  public set entity(entity: TEntity) {
    if (null == entity) {
      throw new Error('An entity was expected.');
    }
    this._entity = entity;
    this._id = entity[this._model.id];
  }
}
