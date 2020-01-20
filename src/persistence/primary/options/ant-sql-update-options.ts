import { AntJsUpdateOptions } from '@antjs/ant-js/build/persistence/primary/options/antjs-update-options';
import { CacheMode } from '@antjs/ant-js';
import { SqlUpdateOptions } from './sql-update-options';

export class AntSqlUpdateOptions extends AntJsUpdateOptions implements SqlUpdateOptions {
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
   * @param cacheMode Cache mode to use.
   * @param ttl TTL of the entities to update.
   * @param ignoreCache True to ignore the cache system.
   * @param persist True to persist changes in the sql server.
   */
  public constructor(cacheMode?: CacheMode, ttl?: number, ignoreCache = false, persist = true) {
    super(cacheMode, ttl);

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
