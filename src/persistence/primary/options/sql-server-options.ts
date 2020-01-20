export interface SqlServerOptions {
  /**
   * True to ignore the cache system.
   */
  readonly ignoreCache: boolean;
  /**
   * True to persist the changes.
   */
  readonly persist: boolean;
}
