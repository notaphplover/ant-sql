# 3. Adding simple queries (Javascript)

We are now able to define multiple models and find entities by ids. ¿What if we want to perform a more complex search? Don't worry, here comes __queries__ to the rescue

AntJS based libraries allow to use __query managers__ to define queries. Defining queries is a good way to perform search. The benefits of defining queries through the query manager are the following ones:

  1. The __AntJs model manager__ takes care of cache search and cache sync in an efficient way. You can learn more about queries in the [AntJs queries doc](https://notaphplover.github.io/ant-js/fundamentals/queries.html)
  2. The __AntSql model manager__ (an extension of the previous one) takes care of requesting data to the database trying to minimize the number of queries to perform and data to request.

In this tutorial we will learn to define simple queries. Simple queries allow us to configure queries in an easy way. We won't be able to define some kind of queries using simple queries, but AntSQL provide us complementary tools to define those ones.

## ¿Which kind of queries can I define as simple queries?

You can define simple queries implemented in the __configuration factory__. The configuration factory is accesible from the __cfgGen__ property of an AntSQL model manager.

The simple queries currently implemented are the following ones:

  - Queries by field's value.
  - Queries by multiple fields value.
  - Queries of all entities.

Let's put this on practise. In this tutorial we are implementing to search users whose username is a certain string.

The idea is to inject the queries into the manager. It could be a good idea to provide an interface for injecting queries and then coding a class that implements the interface:

__src/provider/UserQueriesProvider.ts__
```javascript
'use strict';

class UserQueriesProvider {

  /**
   * Injects queries in the user manager and returns the query managers generated.
   * @param { import('knex') } _ Knex instance.
   * @param { import('@antjs/ant-sql').ApiSqlModelManager } antModelManager User manager
   * @param { import('@antjs/ant-sql').SqlModel } model User model
   * @returns { object } Queries object.
   */
  injectQueries(
    _,
    antModelManager,
    model,
  ) {
    return {
      userByUsernameQuery: this._addUserByUsernameQuery(
        antModelManager, model,
      ),
    };
  }

  /**
   * Adds a "users by username" query.
   * @param { import('@antjs/ant-sql').ApiSqlModelManager } userManager User manager
   * @param { import('@antjs/ant-sql').SqlModel } userModel User model
   * @returns { import('@antjs/ant-js').ApiSingleResultQueryManager } Query manager created.
   */
  _addUserByUsernameQuery(userManager, userModel) {
    return userManager.query(
      userManager.cfgGen.byUniqueField(userModel.getColumn('username')),
    );
  }
}

module.exports = { UserQueriesProvider };

```

Let's explain the process:

- `userManager.query` is the query generator function. It requires a query configuration in order to generate a query. The generic type passed is the returning type of the query (remember that a query is a [request for ids](https://notaphplover.github.io/ant-js/fundamentals/queries.html))
- We are using simple queries, so we are using the configurator factory `userManager.cfgGen` to provide the query configuration.


Once we have our provider, we can just use it in out AntSqlProvider:

__src/provider/AntSqlProvider.ts__

```typescript
...

const { userByUsernameQuery } = new UserQueriesProvider().injectQueries(
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
  userByUsernameQuery,
};

```

That's all, we are ready to work with the query managers!

You can access the [tutorial repository](https://github.com/notaphplover/ant-js-tutorial) in order to see the code in action. If you have Docker installed, you will be able to run the code with the following command:

```
npm run docker-test-user-simple-queries-js
```

Next tutorial: Adding queries ([Javascript](./4_adding_queries_js.md) or [Typescript](./4_adding_queries_ts.md)).

