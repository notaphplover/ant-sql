# 3. Adding simple queries (Typescript)

We are now able to define multiple models and find entities by ids. ¿What if we want to perform a more complex search? Don't worry, here comes __queries__ to the rescue

AntJS based libraries allow to use __query managers__ to define queries. Defining queries is a good way to perform search. The benefits of defining queries through the query manager are the following ones:

  1. The __AntJs model manager__ takes care of cache search and cache sync in an efficient way.
  2. The __AntSql model manager__ (an extension of the previous one) takes care of requesting data to the database trying to minimize the number of queries to perform and data to request.

In this tutorial we will learn to define simple queries. Simple queries allow us to configure queries in an easy way. We won't be able to define some kind of queries using simple queries, but AntSQL provide us complementary tools to define those ones.

## ¿Which kind of queries can I define as simple queries?

You can define simple queries implemented in the __configuration factory__. The configuration factory is accesible from the __cfgGen__ property of an AntSQL model manager.

The simple queries currently implemented are the following ones:

  - Queries by field's value.
  - Queries by multiple fields value.
  - Queries of all entities.

Let's put this on practise. In this tutorial we are implementing to search users whose username is a certain string.

The idea is to inject the queries into the manager. Let's create our query injector:
