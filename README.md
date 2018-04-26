# Elasticsearch: Get Family - Node.js

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/plotlabs/esgetfamily-node/blob/master/LICENSE.txt) [![Build Status](https://travis-ci.org/plotlabs/esgetfamily-node.svg?branch=master)](https://travis-ci.org/plotlabs/esgetfamily-node) [![CodeFactor](https://www.codefactor.io/repository/github/plotlabs/esgetfamily-node/badge)](https://www.codefactor.io/repository/github/plotlabs/esgetfamily-node) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://www.plotlabs.io/) [![npm](https://img.shields.io/npm/v/esgetfamily.svg)](https://www.npmjs.com/package/esgetfamily)

The following library helps you get a unified result with parents having result of children in a **single result** with scroll and custom query.

# Installation

```console
npm install esgetfamily --save
npm install esgetfamily
```

## Using in node.js

```js
var esgetfamily = require('esgetfamily');
esgetfamily(
  'http://localhost:9200',
  {
    index: 'es-getfamilytest',
    parent_type: 'parent',
    child_type: 'child'
  },
  [
    {
      _index: 'es-getfamilytest',
      _type: 'parent',
      _id: '1',
      _score: 1,
      _source: {
        id: 1,
        no_employee: 23,
        company: 'Plotlabs'
      }
    }
  ],
  [
    {
      match: {
        employee_name: 'employee 1'
      }
    }
  ],
  function(error, result) {
    // Do something here.
  }
);
```

## Arguments

The function takes following arguments and in the following order

```js
esgetfamily(
  < URL >,
  < connection parameters>,
  < data >,
  < filter >,
  function(error, result){
      // Do something here.
  }
);
```

* **URL**: Mention the URL of either localhost or remote server
* **connection parameters**: The argument has three parts `{ index: "name of the index", parent_type: "name of the parent type", children_type: "name of the children type" }`
* **data**: pass any data array of parent object/objects. '\_id' in each object is essential for it to parse it's child
* **filter**: you can pass any valid query object for eg. `[{match: { "employee_name":"employee 1" }}]`
* **callback**: simple callback function with error as first argument

## Result

The result are in the form:

```json
[
  {
    "_index": "es-getfamilytest",
    "_type": "parent",
    "_id": "1",
    "_score": 1,
    "_source": { "id": 1, "no_employee": 23, "company": "Plotlabs" },
    "children": [
      {
        "_index": "es-getfamilytest",
        "_type": "child",
        "_id": "1",
        "_score": 1,
        "_routing": "1",
        "_parent": "1",
        "_source": { "id": 1, "name": "employee1" }
      }
    ]
  }
]
```
