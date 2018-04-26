# Elasticsearch: parent-child-single-result

The following library helps you get a unified result with parents having result of children in a **single result** with scroll and custom query.

# Installation

>`npm install esgetfamily --save`
`npm install esgetfamily`

## Using in node.js

>`var esgetfamily = require('esgetfamily');`

> `esgetfamily('http://localhost:9200',
{index: 'es-getfamilytest',
parent_type:'parent',
child_type:'child'},
[ { _index: 'es-getfamilytest',
    _type: 'parent',
    _id: '1',
    _score: 1,
    _source: { id: 1, no_employee: 23, company: 'Plotlabs' } } ]
,[{match: {
  "employee_name":"employee 1"
}}],
function ( error,result) {
//do something here)})`


## Arguments

The function takes following arguments and in the following order
esgetfamily(< URL >,< connection parameters>,< data >,< filter >, function(error, result){
...})`

 - < URL >: Mention the URL of either localhost or remote server
 -  < connection parameters >: The argument has three parts 1)
 { index: "name of the index", 	parent_type: "name of the parent type", 	children_type: "name of the children type" 	}
 - < data >: pass any data array of parent object/objects. '_id' in each object is essential for it to parse it's child
 - < filter >: you can pass any valid query object for eg.
   	 [{match: {   	  "employee_name":"employee 1"    		}}]
  - < callback >: simple callback function with error as first argument

## Result
The result are in the form:
> [ { _index: 'es-getfamilytest',
    _type: 'parent',
    _id: '1',
    _score: 1,
    _source: { id: 1, no_employee: 23, company: 'Plotlabs' },
    children:
   [
  { _index: 'es-getfamilytest',
    _type: 'child',
    _id: '1',
    _score: 1,
    _routing: '1',
    _parent: '1',
    _source: { id: 1, name: 'employee1' } }
 ]



## License

Copyright 2018 COPYRIGHT PlotLabs technologies Pvt. Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

