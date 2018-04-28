/**
 *
 *
 * @File: Main Module
 * @Author: Ananya Goel
 * @Organisation: PlotLabs Technologies
 * @Website: https://www.plotlabs.io/
 * @License: The MIT License (MIT)
 *
 *
 */

const _ = require('lodash');
const elasticsearch = require('elasticsearch');

module.exports = function family(url, es_db, data, filter = [], callback) {
  /**
   *
   * Create ES Client Connection.
   *
   */
  const client = new elasticsearch.Client({
    host: url,
    requestTimeout: Infinity
  });

  /**
   *
   * Type: Object.
   * Create ES search qeury.
   *
   */
  const searchQuery = {
    index: es_db.index,
    type: es_db.child_type,
    scroll: '5m',
    body: { query: { bool: { must: filter } } }
  };

  /**
   *
   * Type: Object.
   * Page data by _id.
   *
   */
  const parentIds = _.map(data, '_id');

  /**
   *
   * Type: Object.
   * Create filter object.
   *
   */
  const parentSearchObj = {
    has_parent: {
      parent_type: es_db.parent_type,
      query: { ids: { values: parentIds } }
    }
  };

  /**
   *
   * Push data to filter array.
   *
   */
  filter.push(parentSearchObj);

  /**
   *
   * Type: Function.
   * Create response data.
   *
   */
  const getMoreUntilDone = function(error, result) {
    if (error) {
      callback(error, null);
    } else {
      let children;
      let count;

      /**
       *
       * Type: Function.
       * Combine parent and
       * children data.
       *
       */
      const mapData = function(obj) {
        children = _.filter(result.hits.hits, {
          _parent: obj._id
        });
        count = count + children.length;
        if (obj['children']) {
          obj.children.push(...children);
        } else {
          obj.children = children;
        }
      };

      /**
       *
       * Perform mapping task.
       *
       */
      _.map(data, mapData);

      /**
       *
       * Query additional documents
       * if available.
       *
       */
      if (result.hits.total > count) {
        client.scroll(
          {
            scrollId: result._scroll_id,
            scroll: '5m'
          },
          getMoreUntilDone
        );
      } else {
        callback(null, data);
      }
    }
  };

  /**
   *
   * Perform ES search query.
   *
   */
  client.search(searchQuery, getMoreUntilDone);
};
