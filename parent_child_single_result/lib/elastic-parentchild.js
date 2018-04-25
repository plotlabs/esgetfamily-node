/**
 * Created by ananyagoel on 16/04/18.
 */


var _ = require('lodash');
var elasticsearch = require("elasticsearch");


module.exports =function family(url,es_db,data, filter,callback) {
    var client;
    var parent_id_array;
    var total_count=0;
    var parent_id_search_object;
    var children;

    client =  new elasticsearch.Client({
        host: url,
        requestTimeout: Infinity
    });
    if(typeof(filter) === 'undefined' || filter.length === 0){
        filter=[]
    }
    parent_id_array = _.map(data, "_id");
    parent_id_search_object =
        {
        has_parent: {
            parent_type: es_db.parent_type,
            query:{
                ids:{
                    values: parent_id_array
                }
            }
        }
    }

    filter.push(parent_id_search_object);

    client.search({
        index: es_db.index,
        type: es_db.child_type,
        scroll:'5m',
        body: {
            query: {
                bool: {
                    must:filter
                }
            }
        }
    }, function getMoreUntilDone(error, result) {
        var response_array = [];
        if (error) {
            console.error(error);
            callback(error,null);
        } else {
            response_array=result.hits.hits;
            _.map(data, function (obj) {
                children=_.filter(response_array, {_parent: obj._id});
                total_count = total_count+children.length;

                if(obj['children']){
                    obj.children.push(...children);
                }else{
                    obj.children=children
                }
            });
                if (result.hits.total > total_count) {
                    client.scroll({
                        scrollId: result._scroll_id,
                        scroll: '5m'
                    }, getMoreUntilDone);
                } else {
                    callback(null,data);


                }
        }
    });

}
