import { AntJsUpdateOptions } from '@antjs/ant-js/src/persistence/primary/options/antjs-update-options';
import { CacheMode } from '@antjs/ant-js/src/persistence/primary/options/cache-mode';
import { IAntSqlUpdateOptions } from './IAntSqlUpdateOptions';

export class AntSqlUpdateOptions extends AntJsUpdateOptions implements IAntSqlUpdateOptions {
  /**
   * True to persist the changes.
   */
  protected _persist: boolean;

  /**
   * Creates a new AntSql delete options.
   * @param cacheMode Cache mode to use.
   * @param ttl TTL of the entities to update.
   * @param persist True to persist changes in the sql server.
   */
  public constructor(
    cacheMode?: CacheMode,
    ttl?: number,
    persist: boolean = true,
  ) {
    super(cacheMode, ttl);

    this._persist = persist;
  }

  /**
   * @inheritdoc
   */
  public get persist(): boolean {
    return this._persist;
  }
}
