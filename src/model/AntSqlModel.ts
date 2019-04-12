import { IKeyGenParams } from '@antjs/ant-js/src/model/IKeyGenParams';
import { Model } from '@antjs/ant-js/src/model/Model';
import { IAntSqlModel } from './IAntSqlModel';

export class AntSqlModel extends Model implements IAntSqlModel {
  /**
   * SQL table name.
   */
  protected _tableName: string;

  /**
   * Constructor.
   * @param id Model's id.
   * @param keyGen Key generation config.
   * @param tableName SQL table name.
   */
  public constructor(
    id: string,
    keyGen: IKeyGenParams,
    tableName: string,
  ) {
    super(id, keyGen);

    this._tableName = tableName;
  }

  /**
   * SQL table name.
   */
  public get tableName(): string {
    return this._tableName;
  }
}
