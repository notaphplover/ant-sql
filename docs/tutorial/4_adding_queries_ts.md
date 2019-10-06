# 3. Adding queries (Typescript)

We are now able to define multiple models and find entities by ids or by other fields. ¿What if we want to perform a more complex search? It's time to use queries.

In this tutorial we are creating two queries:

  1. A query to search all the users whose username is a certain string.
  2. A query to search all the users whose username starts by a certain letter.

Now, the idea is to inject the queries into the manager. It could be a good idea to provide an interface for injecting queries and then coding a class that implements the interface:

__src/provider/IQueryInjector.ts__
```typescript
import { IAntModelManager } from '@antjs/ant-js/src/api/IAntModelManager';
import { IEntity } from '@antjs/ant-js/src/model/IEntity';
import { IPrimaryQueryManager } from '@antjs/ant-js/src/persistence/primary/query/IPrimaryQueryManager';
import { IAntSqlModelConfig } from '@antjs/ant-sql/src/api/config/IAntSqlModelConfig';
import { IAntSqlModel } from '@antjs/ant-sql/src/model/IAntSqlModel';
import * as Knex from 'knex';

export interface IQueryInjector<TEntity extends IEntity> {

  /**
   * Injects queries in an AntJS model manager.
   * @param knex Knex instance.
   * @param antModelManager ant model manager where the queries will be injected.
   * @param model Queries model.
   */
  injectQueries(
    knex: Knex,
    antModelManager: IAntModelManager<TEntity, IAntSqlModelConfig>,
    model: IAntSqlModel,
  ): { [key: string]: IPrimaryQueryManager<TEntity> };
}

```

Now, let's create our query injector:

__src/provider/UserQueriesProvider.ts__
```typescript
import { IAntModelManager } from '@antjs/ant-js/src/api/IAntModelManager';
import { IPrimaryQueryManager } from '@antjs/ant-js/src/persistence/primary/query/IPrimaryQueryManager';
import { IAntSqlModelConfig } from '@antjs/ant-sql/src/api/config/IAntSqlModelConfig';
import { IAntSqlModel } from '@antjs/ant-sql/src/model/IAntSqlModel';
import * as Knex from 'knex';
import { IUser } from '../entity/IUser';
import { IQueryInjector } from './IQueryInjector';

export class UserQueriesProvider implements IQueryInjector<IUser> {

  public injectQueries(
    knex: Knex,
    antModelManager: IAntModelManager<IUser, IAntSqlModelConfig>,
    model: IAntSqlModel,
  ): { [key: string]: IPrimaryQueryManager<IUser>; } {
    return {
      usersByUsernameQuery: this._addUsersByUsernameQuery(
        knex, antModelManager, model,
      ),
      usersStartingByLetterQuery: this._addUsersStartingByLetterQuery(
        knex, antModelManager, model,
      ),
    };
  }

  private _addUsersByUsernameQuery(
    knex: Knex,
    userManager: IAntModelManager<IUser, IAntSqlModelConfig>,
    userModel: IAntSqlModel,
  ): IPrimaryQueryManager<IUser> {
    const usersByUsername = (params: any) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      const username: string = params.username;
      if (!username) {
        throw new Error('Expected an username!');
      }
      return knex
        .select(userModel.id)
        .from(userModel.tableName)
        .where('username', username)
        .first()
        .then(
          (result: { id: number }) => result ? result.id : null,
        ) as unknown as Promise<number>;
    };

    return userManager.query<number>({
      isMultiple: false,
      query: usersByUsername,
      queryKeyGen: (params: any) => 'user/name::' + params.letter,
      reverseHashKey: 'user/name/reverse',
    }) as IPrimaryQueryManager<IUser>;
  }

  private _addUsersStartingByLetterQuery(
    knex: Knex,
    userManager: IAntModelManager<IUser, IAntSqlModelConfig>,
    userModel: IAntSqlModel,
  ): IPrimaryQueryManager<IUser> {
    const usersStaringByLetterDBQuery = (params: any) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      const letter: string = params.letter;
      if (!letter || letter.length !== 1) {
        throw new Error('Expected a letter!');
      }
      return knex
        .select(userModel.id)
        .from(userModel.tableName)
        .where('username', 'like', letter + '%')
        .then(
          (results: Array<{ id: number }>) => results.map((result) => result.id),
        ) as unknown as Promise<number[]>;
    };
    return userManager.query<number[]>({
      isMultiple: true,
      query: usersStaringByLetterDBQuery,
      queryKeyGen: (params: any) => 'user/name-start::' + params.letter,
      reverseHashKey: 'user/name-start/reverse',
    }) as IPrimaryQueryManager<IUser>;
  }
}

```

The steps to follow are simple. For each query:

  1. Create a query to the database. We are using knex for this purpose. Keep in mind that this query must return an id or a collection of ids of the entities that must be the result of the query.
  2. Create the AntJS query generation object. This object has the following params:

  * __entityKeyGen (optional)__: function that determines, for an entity, the redis key of the query associated to the entity. If no entityKeyGen is provided, the function provided as queryKeyGen will be used for this purpose.
  * __isMultiple__: Must be true if the query returns an array of ids (that could be empty) or false if the query returns one id (that could be null if no entity is valid).
  * __queryKeyGen__: function that determines, for each query params, the redis key of the query results.
  * __query__: Query created at the step 1.
  * __reverseHashKey__: Key of a special hash that is used by this library to manage query results of this query.

  3. Call the query method of the model manager passing the query genertion object. A query manager will be generated and returned.

Once we have our provider, we can just use it in out AntSqlProvider:

__src/provider/AntSqlProvider.ts__

```typescript
...

const {
  usersByUsernameQuery,
  usersStartingByLetterQuery,
} = new UserQueriesProvider().injectQueries(
  knex, userManager, userModel,
);

...
```

Don't forget to export the query managers, they are the objects we will use to perform queries.

```typescript
...

export {
  manager,
  userManager,
  usersByUsernameQuery,
  usersStartingByLetterQuery,
};

```

That's all, we are ready to work with the query managers!

You can access the [tutorial repository](https://github.com/notaphplover/ant-js-tutorial) in order to see the code in action. If you have Docker installed, you will be able to run the code with the following command:

```
npm run docker-test-user-queries-ts
```
