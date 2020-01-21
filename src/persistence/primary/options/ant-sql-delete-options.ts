import { AntJsDeleteOptions } from '@antjs/ant-js/build/persistence/primary/options/antjs-delete-options';
import { SqlDeleteOptions } from './sql-delete-options';

export class AntSqlDeleteOptions extends AntJsDeleteOptions implements SqlDeleteOptions {
  /**
   * True to ignore the cache system.
   */
  protected _ignoreCache: boolean;
  /**
   * True to persist the changes.
   */
  protected _persist: boolean;

  /**
   * Creates a new AntSql delete options.
   * @param negativeCache True to use negative cache
   * @param ignoreCache True to ignore the cache system.
   * @param persist True to persist changes in the sql server.
   */
  public constructor(negativeCache?: boolean, ignoreCache = false, persist = true) {
    super(negativeCache);

    this._ignoreCache = ignoreCache;
    this._persist = persist;
  }

  /**
   * @inheritdoc
   */
  public get ignoreCache(): boolean {
    return this._ignoreCache;
  }

  /**
   * @inheritdoc
   */
  public get persist(): boolean {
    return this._persist;
  }
}
