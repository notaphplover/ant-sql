import { Entity, KeyGenParams } from '@antjs/ant-js';
import { AntModel } from '@antjs/ant-js/build/model/ant-model';
import { AntSqlReference } from './ref/ant-sql-reference';
import { ApiSqlColumn } from '../api/api-sql-column';
import { SqlColumn } from './sql-column';
import { SqlModel } from './sql-model';
import { SqlReference } from './ref/sql-reference';
import { SqlType } from './sql-type';

export class AntSqlModel<TEntity extends Entity> extends AntModel<TEntity> implements SqlModel<TEntity> {
  /**
   * Model alias
   */
  protected _alias: string;
  /**
   * Auto generated column.
   */
  protected _autoGeneratedColumn: SqlColumn;
  /**
   * Map of table columns, including the id;
   * The key of the map is the alias of the column in the entities managed.
   * The value of the map is the column info.
   */
  protected _columns: Map<string, SqlColumn>;
  /**
   * Map of columns by type
   */
  protected _columnsByType: Map<SqlType, SqlColumn[]>;
  /**
   * Non reference columns.
   */
  protected _nonReferenceColumns: SqlColumn[];
  /**
   * Referenced columns collection.
   */
  protected _referenceColumns: SqlColumn[];
  /**
   * Map of table colunms, including the id.
   * The key of the map is the alias of the column in the SQL table.
   * The value of the map is the column info.
   */
  protected _sqlColumns: Map<string, SqlColumn>;
  /**
   * SQL table name.
   */
  protected _tableName: string;

  /**
   * Constructor.
   * @param id Model's id.
   * @param keyGen Key generation config.
   * @param columns Model columns.
   * @param tableName SQL table name.
   * @param alias Model alias.
   */
  public constructor(
    id: string,
    keyGen: KeyGenParams,
    columns: Iterable<ApiSqlColumn>,
    tableName: string,
    alias?: string,
  ) {
    super(id, keyGen);

    this._alias = alias;
    this._initializeColumns(columns);
    this._tableName = tableName;
  }

  /**
   * Model's alias
   */
  public get alias(): string {
    return this._alias;
  }

  /**
   * Table columns.
   */
  public get columns(): Iterable<SqlColumn> {
    return this._columns.values();
  }

  /**
   * SQL table name.
   */
  public get tableName(): string {
    return this._tableName;
  }

  /**
   * Gets a column by its alias
   */
  public columnByAlias(alias: string): SqlColumn {
    return this._columns.get(alias);
  }

  /**
   * Gets a column by an SQL alias.
   * @param alias Alias of the column at the SQL server.
   * @returns Column.
   */
  public columnBySql(alias: string): SqlColumn {
    return this._sqlColumns.get(alias);
  }

  /**
   * Transforms an entity into a primary
   * @param entity Entity to process
   * @returns Primary object generated.
   */
  public entityToPrimary(entity: TEntity): any {
    const primary: any = {};
    for (const column of this._nonReferenceColumns) {
      primary[column.entityAlias] = entity[column.entityAlias];
    }
    for (const column of this._referenceColumns) {
      primary[column.entityAlias] = (entity[column.entityAlias] as SqlReference<Entity, number | string>).id;
    }
    return primary;
  }

  /**
   * Transforms an entity into a secondary object.
   * @param entity Entity to process.
   * @returns Secondary object
   */
  public entityToSecondary(entity: TEntity): any {
    const secondary: { [key: string]: any } = {};
    for (const column of this._nonReferenceColumns) {
      const entityValue = entity[column.entityAlias];
      if (undefined !== entityValue) {
        secondary[column.sqlName] = entityValue;
      }
    }
    for (const column of this._referenceColumns) {
      const entityValue = entity[column.entityAlias];
      if (undefined !== entityValue) {
        secondary[column.sqlName] = (entityValue as SqlReference<TEntity, number | string>).id;
      }
    }
    return secondary;
  }

  /**
   * Gets the auto generated column of the model.
   * @returns Auto generated column of the model or null if no column is auto generated.
   */
  public getAutoGeneratedColumn(): SqlColumn {
    return this._autoGeneratedColumn;
  }

  /**
   * Transforms multiple entities into primary objects.
   * @param entities Entities to process.
   * @returns Primary objects generated.
   */
  public mEntityToPrimary(entities: TEntity[]): any[] {
    const primaries = new Array(entities.length);

    for (let i = 0; i < entities.length; ++i) {
      primaries[i] = this.entityToPrimary(entities[i]);
    }

    return primaries;
  }

  /**
   * Transforms multiple entities into primary objects.
   * @param entities Entities to process.
   * @returns Secondary objects generated.
   */
  public mEntityToSecondary(entities: TEntity[]): any[] {
    const secondaries = new Array(entities.length);

    for (let i = 0; i < entities.length; ++i) {
      secondaries[i] = this.entityToSecondary(entities[i]);
    }

    return secondaries;
  }

  /**
   * @inheritdoc
   */
  public mPrimaryToEntity(primaries: any[]): TEntity[] {
    const entities = new Array<TEntity>(primaries.length);

    for (let i = 0; i < primaries.length; ++i) {
      entities[i] = { ...primaries[i] };
    }
    const dateColumns = this._columnsByType.get(SqlType.Date);
    if (undefined !== dateColumns) {
      for (const entity of entities) {
        for (const column of dateColumns) {
          (entity as any)[column.entityAlias] = new Date(entity[column.entityAlias]);
        }
      }
    }
    for (const column of this._referenceColumns) {
      for (const entity of entities) {
        (entity as any)[column.entityAlias] = new AntSqlReference(entity[column.entityAlias], column.refModel);
      }
    }
    return entities;
  }

  /**
   * Process secondary objects and generates entities from them.
   * @param secondaries Secondary objects to process.
   * @returns Entities generated.
   */
  public mSecondaryToEntity(secondaries: any[]): TEntity[] {
    const entities = new Array<TEntity>(secondaries.length);

    for (let i = 0; i < secondaries.length; ++i) {
      entities[i] = this.secondaryToEntity(secondaries[i]);
    }

    return entities;
  }

  /**
   * @inheritdoc
   */
  public primaryToEntity(primary: any): TEntity {
    // Spread operator is ridiculously fast
    const entity = { ...primary };
    const dateColumns = this._columnsByType.get(SqlType.Date);
    if (undefined !== dateColumns) {
      for (const column of dateColumns) {
        entity[column.entityAlias] = new Date(entity[column.entityAlias]);
      }
    }
    for (const column of this._referenceColumns) {
      entity[column.entityAlias] = new AntSqlReference(entity[column.entityAlias], column.refModel);
    }

    return entity;
  }

  /**
   * Creates an entity from a secondary object.
   * @param secondary Secondary entity to transform
   * @returns Entity generated.
   */
  public secondaryToEntity(secondary: any): TEntity {
    const entity: { [key: string]: any } = {};

    for (const column of this._nonReferenceColumns) {
      entity[column.entityAlias] = secondary[column.sqlName];
    }
    for (const column of this._referenceColumns) {
      entity[column.entityAlias] = new AntSqlReference(secondary[column.sqlName], column.refModel);
    }

    const booleanColumns = this._columnsByType.get(SqlType.Boolean);
    if (undefined !== booleanColumns) {
      for (const column of booleanColumns) {
        entity[column.entityAlias] = Boolean(entity[column.entityAlias]);
      }
    }

    const dateColumns = this._columnsByType.get(SqlType.Date);
    if (undefined !== dateColumns) {
      for (const column of dateColumns) {
        entity[column.entityAlias] = new Date(entity[column.entityAlias]);
      }
    }

    return entity as TEntity;
  }

  /**
   * Generates a sql column from an API sql column
   * @param column Column to process.
   */
  private _apiColumnToColumn(column: ApiSqlColumn): SqlColumn {
    return {
      autoGenerationStrategy: column.autoGenerationStrategy,
      entityAlias: column.entityAlias,
      refAlias: column.refAlias,
      sqlName: column.sqlName,
      type: column.type,
    };
  }

  /**
   * Initializes the columns map.
   * @param columns Columns to set.
   */
  private _initializeColumns(columns: Iterable<ApiSqlColumn>): void {
    this._autoGeneratedColumn = null;
    this._columns = new Map();
    this._columnsByType = new Map();
    this._nonReferenceColumns = new Array();
    this._referenceColumns = new Array();
    this._sqlColumns = new Map();
    for (const column of columns) {
      const modelColumn: SqlColumn = this._apiColumnToColumn(column);
      this._initializeColumnsSetAutoGeneratedColumn(modelColumn);
      this._columns.set(modelColumn.entityAlias, modelColumn);
      this._sqlColumns.set(modelColumn.sqlName, modelColumn);
      this._initializeColumnsSetColumnsOfType(modelColumn);
      this._initializeColumnsSetReferenceColumn(column);
    }
  }

  /**
   * Process a column adding an entry to the columns by type map.
   * @param column Column to process.
   */
  private _initializeColumnsSetColumnsOfType(column: SqlColumn): void {
    let columnsOfType = this._columnsByType.get(column.type);
    if (undefined === columnsOfType) {
      columnsOfType = new Array();
      this._columnsByType.set(column.type, columnsOfType);
    }
    columnsOfType.push(column);
  }

  /**
   * Process a column establishing the autogenerated column.
   * @param column Column to process.
   */
  private _initializeColumnsSetAutoGeneratedColumn(column: SqlColumn): void {
    if (null != column.autoGenerationStrategy) {
      if (null === this._autoGeneratedColumn) {
        this._autoGeneratedColumn = column;
      } else {
        throw new Error('Unexpected auto generated column. There is already an auto generated column in this model');
      }
    }
  }

  /**
   * Process a column adding it to the reference columns of the model (if necessary).
   * @param column Column to process.
   */
  private _initializeColumnsSetReferenceColumn(column: SqlColumn): void {
    if (null == column.refAlias) {
      this._nonReferenceColumns.push(column);
    } else {
      this._referenceColumns.push(column);
    }
  }
}
