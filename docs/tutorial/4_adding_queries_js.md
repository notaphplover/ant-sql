# 3. Adding queries (Javascript)

We are now able to define multiple models and find entities by ids or by other fields. ¿What if we want to perform a more complex search? It's time to use queries.

In this tutorial we are creating two queries:

  1. A query to search all the users whose username is a certain string.
  2. A query to search all the users whose username starts by a certain letter.

Now, the idea is to inject the queries into the manager. Let's create our query injector:

__src/provider/UserQueriesProvider.js__
```javascript
'use strict';

class UserQueriesProvider {

  /**
   * Injects queries in the user manager and returns the query managers generated.
   * @param { import('knex') } knex Knex instance.
   * @param { import('@antjs/ant-sql/src/api/AntSqlModelManager').AntSqlModelManager } antModelManager User manager
   * @param { import('@antjs/ant-sql/src/model/AntSqlModel').AntSqlModel } model User model
   * @returns { object } Queries object.
   */
  injectQueries(
    knex,
    antModelManager,
    model,
  ) {
    return {
      usersByUsernameQuery: this._addUsersByUsernameQuery(
        knex, antModelManager, model,
      ),
      usersStartingByLetterQuery: this._addUsersStartingByLetterQuery(
        knex, antModelManager, model,
      ),
    };
  }

  /**
   * Adds a "users by username" query.
   * @param { import('knex') } knex Knex instance.
   * @param { import('@antjs/ant-sql/src/api/AntSqlModelManager').AntSqlModelManager } userManager User manager
   * @param { import('@antjs/ant-sql/src/model/AntSqlModel').AntSqlModel } userModel User model
   * @returns { import('@antjs/ant-js/src/persistence/primary/query/SingleResultQueryManager') } Query manager created.
   */
  _addUsersByUsernameQuery(
    knex,
    userManager,
    userModel,
  ) {
    /**
     * Serachs for an user whose username is the username provided.
     * @param { object } params Query params
     * @returns { Promise<number> } Promise of id found.
     */
    const usersByUsername = (params) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      /** @type string */
      const username = params.username;
      if (!username) {
        throw new Error('Expected an username!');
      }
      return knex
        .select(userModel.id)
        .from(userModel.tableName)
        .where('username', username)
        .first()
        .then(
          (result) => result ? result.id : null,
        );
    };

    return userManager.query({
      isMultiple: false,
      query: usersByUsername,
      queryKeyGen: (params) => 'user/name::' + params.letter,
      reverseHashKey: 'user/name/reverse',
    });
  }

  /**
   * Adds a "users starting with letter" query.
   * @param { import('knex') } knex Knex instance.
   * @param { import('@antjs/ant-sql/src/api/AntSqlModelManager').AntSqlModelManager } userManager User manager
   * @param { import('@antjs/ant-sql/src/model/AntSqlModel').AntSqlModel } userModel User model
   * @returns { import('@antjs/ant-js/src/persistence/primary/query/MultipleResultQueryManager') } query manager created.
   */
  _addUsersStartingByLetterQuery(
    knex,
    userManager,
    userModel,
  ) {
    /**
     * Search fot users whose username starts with a letter.
     * @param { object } params Query params.
     * @returns { Promise<number[]> } Promise of ids found.
     */
    const usersStaringByLetterDBQuery = (params) => {
      if (!params) {
        throw new Error('Expected params!');
      }
      /** @type string */
      const letter = params.letter;
      if (!letter || letter.length !== 1) {
        throw new Error('Expected a letter!');
      }
      return knex
        .select(userModel.id)
        .from(userModel.tableName)
        .where('username', 'like', letter + '%')
        .then(
          (results) => results.map((result) => result.id),
        );
    };
    return userManager.query({
      isMultiple: true,
      query: usersStaringByLetterDBQuery,
      queryKeyGen: (params) => 'user/name-start::' + params.letter,
      reverseHashKey: 'user/name-start/reverse',
    });
  }
}

module.exports = { UserQueriesProvider };

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

```javascript
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

```javascript
...

module.exports = {
  manager,
  userManager,
  usersByUsernameQuery,
  usersStartingByLetterQuery,
};

```

That's all, we are ready to work with the query managers!

You can access the [tutorial repository](https://github.com/notaphplover/ant-js-tutorial) in order to see the code in action. If you have Docker installed, you will be able to run the code with the following command:

```
npm run docker-test-user-queries-js
```
