[![Build status](https://travis-ci.com/notaphplover/ant-sql.svg?branch=develop)](https://travis-ci.com/notaphplover/ant-sql.svg?branch=develop)
[![Coverage Status](https://coveralls.io/repos/github/notaphplover/ant-sql/badge.svg?branch=develop)](https://coveralls.io/github/notaphplover/ant-js?branch=develop)

## Description

SQL extension for [AntJS](https://github.com/notaphplover/ant-js).

## Status

Not even in alpha, so please don´t use it for now.

## How to build the library

Just run the build script:

```
npm run build
```

## How to run tests

Tests are dockerized in order to start a redis server and a PostgreSQL server in a virtual environment.

You can run all the tests with the test script:

```
npm test
```

A coverage report will be generated at the coverage directory.

## Aknowledgements

Special thanks to [Pablo López Torres](https://github.com/supertowers) for the theoretical knowledge and conversations that led to this project.