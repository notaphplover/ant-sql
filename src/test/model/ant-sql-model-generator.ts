import { Entity, KeyGenParams } from '@antjs/ant-js';
import * as crypto from 'crypto';
import { AntSqlModel } from '../../model/ant-sql-model';
import { AutoGeneratedStrategyMode } from '../../model/auto-generation-strategy-mode';
import { SqlColumn } from '../../model/sql-column';
import { SqlModel } from '../../model/sql-model';
import { SqlType } from '../../model/sql-type';

const tableNameGenerator = (baseAlias: string) =>
  't_' +
  crypto
    .createHash('md5')
    .update(baseAlias)
    .digest('hex');

export const modelGenerator = <TEntity extends Entity>(
  keyGen: KeyGenParams,
  additionalColumns?: string[] | { [key: string]: string },
  autoGeneratedColumn?: string,
): SqlModel<TEntity> => {
  const idColumn: SqlColumn = { entityAlias: 'id', sqlName: 'id', type: SqlType.Integer };
  if (idColumn.entityAlias === autoGeneratedColumn) {
    idColumn.autoGenerationStrategy = AutoGeneratedStrategyMode.AutoIncrement;
  }
  const columnsArgs: SqlColumn[] = [idColumn];
  if (additionalColumns) {
    if (additionalColumns instanceof Array) {
      for (const column of additionalColumns) {
        if (column === autoGeneratedColumn) {
          columnsArgs.push({
            autoGenerationStrategy: AutoGeneratedStrategyMode.AutoIncrement,
            entityAlias: column,
            sqlName: column,
            type: SqlType.String,
          });
        } else {
          columnsArgs.push({ entityAlias: column, sqlName: column, type: SqlType.String });
        }
      }
    } else {
      for (const column of Object.keys(additionalColumns)) {
        const columnSql = additionalColumns[column];
        if (column === autoGeneratedColumn) {
          columnsArgs.push({
            autoGenerationStrategy: AutoGeneratedStrategyMode.AutoIncrement,
            entityAlias: column,
            sqlName: column,
            type: SqlType.String,
          });
        } else {
          columnsArgs.push({ entityAlias: column, sqlName: columnSql, type: SqlType.String });
        }
      }
    }
  }

  return new AntSqlModel('id', keyGen, columnsArgs, tableNameGenerator(keyGen.prefix));
};
