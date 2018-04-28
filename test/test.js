/**
 *
 *
 * @File: Module Test
 * @Author: Ananya Goel
 * @Organisation: PlotLabs Technologies
 * @Website: https://www.plotlabs.io/
 * @License: The MIT License (MIT)
 *
 *
 */

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client();
const _ = require('lodash');
const BPromise = require('bluebird');
const esgetfamily = require('../lib/elastic-parentchild');
const indexName = 'es-getfamilytest';
const host = 'http://localhost:9200';

/**
 *
 * Type: Object.
 * Defines parent document params.
 *
 */
const parent = {
  properties: {
    id: { type: 'integer' },
    name: { type: 'text' },
    age: { type: 'integer' }
  }
};

/**
 *
 * Type: Object.
 * Defiles child document params.
 *
 */
const child = {
  _parent: {
    type: 'parent'
  },
  properties: {
    id: { type: 'integer' },
    name: { type: 'text' }
  }
};

/**
 *
 * Type: Object.
 * Defiles index params.
 *
 */
const esIndex = {
  index: indexName,
  body: {
    mappings: {
      parent: parent,
      child: child
    }
  }
};

/**
 *
 * Type: Function.
 * Refreshes the index.
 *
 */
const refreshIndex = function() {
  return client.indices.refresh({
    index: indexName
  });
};

/**
 *
 * Type: Function.
 * Accepts: Id, Type, Parent Id.
 * Returns a dummy document.
 *
 */
const dummyData = function(id, type, parent) {
  let object = {
    index: indexName,
    type: type,
    id: id,
    body: { id: id, age: 23, name: 'Plotlabs' + id }
  };
  if (parent) {
    object.parent = parent;
  }
  return object;
};

/**
 *
 * Type: Function.
 * Accepts: Type, Parent Id, Id.
 * Adds document to the index.
 *
 */
const indexDocument = function(id, type, parent) {
  return new BPromise(function(resolve, reject) {
    client.index(dummyData(id, type, parent)).then(function(result) {
      if (result) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

/**
 *
 * Type: Function.
 * Creates multiple dummy children.
 *
 */
const createChildren = function() {
  return BPromise.map(_.range(0, 8), function(id) {
    return indexDocument(id, 'child', 1).then(refreshIndex);
  });
};

/**
 *
 * Type: Object.
 * Defines search query params.
 *
 */
const searchQuery = {
  index: indexName,
  type: 'parent',
  body: { query: { bool: { must: { match: { id: 1 } } } } }
};

/**
 *
 * Type: Function.
 * Accepts: Error, Result.
 * Displays the error or returns results.
 *
 */
const returnInfo = function(error, result) {
  if (error) {
    console.error(error);
  } else {
    console.dir(result[0].children);
    return result;
  }
};

/**
 *
 * Type: Function.
 * Accepts: Result.
 * Gets family documents.
 *
 */
const getResults = function(result) {
  let relations = {
    index: indexName,
    parent_type: 'parent',
    child_type: 'child'
  };
  let filters = [];
  esgetfamily(host, relations, result.hits.hits, filters, returnInfo);
};

/**
 *
 * Test validy of the returned
 * information from Elasticsearch.
 *
 */
describe('Testing the returned data.', function() {
  // Create Indexes and Insert Documents.
  before(function() {
    return client.indices.create(esIndex).then(function() {
      return indexDocument(1, 'parent', null).then(function() {
        return createChildren();
      });
    });
  });
  // Search Index.
  it('Should return parent child result', function() {
    return client.search(searchQuery).then(getResults);
  });
  // Delete Index.
  after(function() {
    return client.indices.delete({
      index: 'es-getfamilytest'
    });
  });
});
