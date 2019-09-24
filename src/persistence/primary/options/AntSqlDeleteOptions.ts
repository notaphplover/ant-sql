import { AntJsDeleteOptions } from '@antjs/ant-js/src/persistence/primary/options/AntJsDeleteOptions'
import { IAntSqlDeleteOptions } from './IAntSqlDeleteOptions';

export class AntSqlDeleteOptions extends AntJsDeleteOptions implements IAntSqlDeleteOptions {
  /**
   * True to persist the changes.
   */
  protected _persist: boolean;

  /**
   * Creates a new AntSql delete options.
   * @param negativeCache True to use negative cache
   * @param persist True to persist changes in the sql server.
   */
  public constructor(negativeCache?: boolean, persist: boolean = true) {
    super(negativeCache);

    this._persist = persist;
  }

  /**
   * @inheritdoc
   */
  public get persist(): boolean {
    return this._persist;
  }
}
