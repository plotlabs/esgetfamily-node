/**
 * Created by ananyagoel on 25/04/18.
 */

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client();
var _ = require('lodash');
var BPromise = require('bluebird');
var esgetfamily = require('../lib/elastic-parentchild');


describe('creating indexes',function () {
    beforeEach(function () {
        // this.timeout(10000);
        return client.indices.create({
            index: 'es-getfamilytest',
            body: {
                mappings: {
                    "par3": {
                        "properties": {
                            "id": {"type": "integer"},
                            "name": {"type": "text"},
                            "age": {"type": "integer"}
                        }
                    },
                    "child": {
                        "_parent": {
                            "type": "par3"

                        },
                        "properties": {
                            "id": {"type": "integer"},
                            "name": {"type": "text"}
                        }
                    }
                }
            }
        }).then(function () {
                return client.index({
                    index: "es-getfamilytest",
                    type: "par3",
                    id:1,
                    body:{
                        id:1,
                        age:23,
                        name: "Plotlabs"
                    }
                }).then(function () {
                    return BPromise.map(_.range(0,8),function (number) {
                        return client.index({
                            index: "es-getfamilytest",
                            type: "child",
                            parent: 1,
                            id:number,
                            body:{
                                id: number,
                                name: "employee"+ number
                            }
                        }).then(function () {
                            return client.indices.refresh({
                                index: 'es-getfamilytest'
                            })
                        })
                    })
                })

            })
        // })

    })




it('should return parent child result', function () {

    return client.search({
        index: 'es-getfamilytest',
        type: 'par3',
        body:{
            query: {
                bool: {
                    must: {
                        match: {
                            id: 1
                        }
                    }
                }
            }
        }
    }).then(function (result) {

            esgetfamily('http://localhost:9200',{index:'es-getfamilytest', parent_type:'par3',child_type:'child'},result.hits.hits,[],function ( error,result2) {
            if(error){

                 console.error(error);
            }
            else{
                console.dir(result2[0].children)
                return result2
            }

            } )

    })
});

    after(function () {
        return client.indices.delete({
            index: 'es-getfamilytest'
        });
    });

});
