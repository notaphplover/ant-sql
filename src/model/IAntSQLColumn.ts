import { AutoGeneratedStrategyMode } from './AutoGenerationStrategyMode';

export interface IAntSQLColumn {
  /**
   * Auto generation strategy.
   */
  autoGenerationStrategy?: AutoGeneratedStrategyMode;
  /**
   * Alias of the column in the entities managed.
   */
  entityAlias: string;
  /**
   * Name of the column.
   */
  sqlName: string;
}