import { IKeyGenParams } from '@antjs/ant-js/src/model/IKeyGenParams';
import { Model } from '@antjs/ant-js/src/model/Model';
import { IAntSQLColumn } from './IAntSQLColumn';
import { IAntSqlModel } from './IAntSqlModel';

export class AntSqlModel extends Model implements IAntSqlModel {
  /**
   * Map of table columns, including the id;
   * The key of the map is the alias of the column in the entities managed.
   * The value of the map is the column info.
   */
  protected _columns: Map<string, IAntSQLColumn>;

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
    columns: Iterable<IAntSQLColumn>,
    tableName: string,
  ) {
    super(id, keyGen);

    this._initializeColumns(columns);
    this._tableName = tableName;
  }

  /**
   * Map of table columns, including the id;
   * The key of the map is the alias of the column in the entities managed.
   * The value of the map is the column info.
   */
  public get columns(): Map<string, IAntSQLColumn> {
    return this._columns;
  }

  /**
   * SQL table name.
   */
  public get tableName(): string {
    return this._tableName;
  }

  /**
   * Initializes the columns map.
   * @param columns Columns to set.
   */
  private _initializeColumns(columns: Iterable<IAntSQLColumn>): void {
    this._columns = new Map();
    for (const column of columns) {
      this._columns.set(column.entityAlias, column);
    }
  }
}
