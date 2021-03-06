# 2. Adding a model (Typescript)

Now, we are ready to connect the library to a database. This tutorial asumes that you have a PostgreSQL database server running.

Let's start adding a user model. The user model has an id field, and an username field. Create the table in the database.

Create an src/provider directory. Lets add inside a module to provide our Models. Our first model will be the user model.

The code for our provider could be the following one:

__src/provider/ModelProvider.ts__
```ts
import { AntSqlModel } from '@antjs/ant-sql';

const userModel = new AntSqlModel(
  'id',
  { prefix: 'user::' },
  [{
    entityAlias: 'id',
    sqlName: 'id',
  }, {
    entityAlias: 'username',
    sqlName: 'username',
  }],
  'User',
);

export { userModel };

```

We have defined our first model:

1. The first argument is the name of the identifier field of the model. AntJS needs models identified by a field.
2. The second argument is the key generation configuration. This config is used to define redis keys. An user with id equal to three will be stored in redis with a 'user::3' key.
3. The third argument is the collection of columns of the model.
4. The fourth argument is the SQL table name.

We will be working with entities of the model, but we have no type defined for our entities. It would be a good idea to create a new interface for defining our entities:

__src/entity/IUser__
```ts
import { Entity } from '@antjs/ant-js';

export interface IUser extends Entity {
  /**
   * User id.
   */
  id: number;
  /**
   * User alias.
   */
  username: string;
}

```

We need to obtain a connection to the database. AntSQL is built on top of knex, so we are using knex to obtain that connection.

The code for the provider could be:

__src/provider/DBProvider.ts__
```ts
import * as Knex from 'knex';

const knex = Knex({
  client: 'pg',
  connection: {
    database : 'antsqltest',
    host : 'ant_db',
    password : 'antpassword',
    user : 'antuser',
  },
  version: '11.2',
});

export { knex };

```

We also need to obtain a connection for the redis server. AntJS uses ioredis for this purpose:

__src/provider/RedisProvider.ts__
```ts
import * as IORedis from 'ioredis';

const REDIS_PORT = 6379;
const REDIS_HOST = 'ant_redis';
const REDIS_DB = 0;

const redis = new IORedis({
  db: REDIS_DB,
  host: REDIS_HOST,
  port: REDIS_PORT,
});

export { redis };

```

Now, lets create our AntManager provider. This provider will be the entrypoint to AntJS. Remember that we are using the SQL extension, so we will create an AntSqlManager instead.

The code could be the following one:

__src/provider/AntSqlProvider.ts__
```typescript
import { AntSqlManager, ApiSqlModelManager } from '@antjs/ant-sql';
import { IUser } from '../entity/IUser';
import { knex } from './DBProvider';
import { userModel } from './ModelProvider';
import { redis } from './RedisProvider';

const manager = new AntSqlManager();
manager.config({
  default: {
    knex: knex,
    redis: redis,
  },
});

const userManager = manager.get(userModel) as ApiSqlModelManager<IUser>;

export {
  manager,
  userManager,
};

```

That's all, we are ready to work with the manager!

You can access the [tutorial repository](https://github.com/notaphplover/ant-js-tutorial) in order to see the code in action. If you have Docker installed, you will be able to run the code with the following command:

```
npm run docker-test-user-entity-ts
```

Next tutorial: Adding simple queries ([Javascript](./3_adding_simple_queries_js.md) or [Typescript](./3_adding_simple_queries_ts.md)).
