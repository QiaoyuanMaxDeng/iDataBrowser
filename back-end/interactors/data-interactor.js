var boundary = require('../boundaries/boundaries')['cassandra'];
var cassandra = require('cassandra-driver');
var moment = require('moment');
var path = require('path');
var columns = ['doc_type', 'doc_title', 'doc_create_time', 'doc_id', 'doc_text', 'doc_expire'];
var insert_keys = ['doc_title'];
var find_keys = ['doc_id', 'doc_title', 'doc_create_time'];

var ERROR_INVALIDA_DATA = 'The data you input is invalidate.';
var ERROR_NO_DATA = 'Could not find data.';


// add doc function with raw data
/*
Input: (required)
doc_title (required)
doc_type (required)

Output:
{
	"success": true,
	"message": {
		"info": {
			"queriedHost": "127.0.0.1",
			"triedHosts": { },
			"achievedConsistency": 1
		},
		"pageState": null,
		"columns": null
	},
	"payload": null
}
*/
function addDocWithRawData(req, res){
	var input = {};

	// get raw data
	for (var index in columns){
		var key = columns[index];
		var value = req.body[key];
		input[key] = value;
	}

	// check validate of key values
	for (var index in insert_keys){
		var key = insert_keys[index];
		if (!validateData(input[key])){
			res.send(new AXResponse(false, ERROR_INVALIDA_DATA));
			return;
		}
	}

	// prepare to input
	// assume most of data is in correct type now
	input['doc_id'] = cassandra.types.uuid();
	input['doc_create_time'] = moment().valueOf();
	input['doc_view_count'] = 0;
	input['doc_type'] = validateData(!input['doc_type'])? input['doc_type'] : 'post';

	// assume expire from input is formated as 2015-05-07T20:07:00-05:00
	// more details: http://momentjs.com/
	input['doc_expire'] = parseInt(input['doc_expire']);

    var query = 'INSERT INTO documents(doc_type, doc_title, doc_create_time, doc_id, doc_text, doc_expire)  VALUES (?, ?, ?, ?, ?, ?)';
    var params = [];
    for (var key in columns){
        params.push(input[columns[key]]);
    }
    console.log(params);
    execute(query, params, function(error, result) {
        if (error)
            res.send(new AXResponse(false, error.message));
        else    
            res.send(new AXResponse(true, result));
    });
}

// find a document by type, title and created time based on current schema
/*
Input: (required)
doc_title,
doc_type,
doc_create_time,

Output:
true/false with result
*/
// find a record
function findDocWithTitleAndTime(req, callback){
	var input = {};

	// get raw data
	for (var index in columns){
		var key = columns[index];
		var value = req.body[key];
		input[key] = value;
	}

	// check validate of key values if finding
	for (var index in find_keys){
		var key = find_keys[index];
		if (!validateData(input[key])){
			callback(false, ERROR_INVALIDA_DATA);
			return;
		}
	}

	input['doc_create_time'] = parseInt(input['doc_create_time']);
	// if (typeof(input['doc_create_time']) == 'string'){
	// 	input['doc_create_time'] = moment(input['doc_create_time']).valueOf();
	// }

    var query = 'SELECT * FROM documents WHERE doc_id = ? AND doc_title = ? AND doc_create_time = ? ALLOW FILTERING';
    var params = [input['doc_id'], input['doc_title'], input['doc_create_time']];

    execute(query, params, function(error, result) {
        if (error)
            // res.send(new AXResponse(error.message, result));
        	callback(false, error.message);
        else    
            // res.send(new AXResponse(true, result.rows));
        	callback(true, result.rows);
    });
}

// cassandra insert is faster than update, so insert with a new date and always read last element 
// update record for now
/*
Input: (Required)
doc_id,
doc_title,
doc_create_time

Output:
true/false
*/
function updateDocWithRawData(req, res){
	findDocWithTitleAndTime(req, function(success, results){
		if (!success || validateData(!results[0])){
			res.send(new AXResponse(false, ERROR_NO_DATA));
			return;
		}

		// prepare to update
		var doc = results[0];
		var input = {};
		for (var index in columns){
			var key = columns[index];
			var value = req.body[key];
			input[key] = value;
		}

	    input['doc_id'] = doc['doc_id'];
		input['doc_create_time'] = parseInt(input['doc_create_time']);
		input['doc_type'] = validateData(!input['doc_type'])? input['doc_type'] : 'post';

    	var query = 'INSERT INTO documents(doc_type, doc_title, doc_create_time, doc_id, doc_text, doc_expire)  VALUES (?, ?, ?, ?, ?, ?)';
	    var params = [];
	    for (var key in columns){
	        params.push(input[columns[key]]);
	    }

	    execute(query, params, function(error, result) {
	        if (error)
	            res.send(new AXResponse(error.message, result));
	        else    
	            res.send(new AXResponse(true, result.rows));
	    });
	})	
}

// find all rows
/*
Input:
N/A
Output:
All rows
*/
function findAll(req, res){
	var query = 'SELECT * FROM documents';
    var params = [];

    execute(query, params, function(error, result) {
        if (error)
            res.send(new AXResponse(error.message, result));
        else    
            res.send(new AXResponse(true, result.rows));
    });
}

// Search function 
/*
Input: (optional)
sample: {'doc_type':'post'}
all except doc_id and doc_create_time
doc_id and doc_create_time will be separate functions for primary clustering keys

Output:
rows of data
*/
// find a record
function basicSearch(req, res){
	var input = {};

	// get raw data
	for (var index in columns){
		var key = columns[index];
		var value = req.body[key];
		if (validateData(value))
			input[key] = value;
	}

	// check validate of key values if finding
	var query = 'SELECT * FROM documents where ';
	var params = [];
	for (var index in input){
		var key = index;
		var value = input[key];
		query = query + key +' = ? AND ';
		params.push(value);
	}

	query = query.substring(0, query.length - 5);
	query = query + ' ALLOW FILTERING';
    execute(query, params, function(error, result) {
        if (error)
            res.send(new AXResponse(error.message, result));
        else    
            res.send(new AXResponse(true, result.rows));
    });
}

// validate data has a value 
function validateData(variable) {
    if (variable == undefined || variable == null || variable == '')    
        return false;
    return true;
}

// alive call to snippet server is alive
function alive(req, res){
	res.send(new AXResponse(true, moment().valueOf()));
}

/* --- helpers---*/
// response helper
function AXResponse(success, message, payload) {
    this.success = success || false;
    this.message = message || null;
    this.payload = payload || null;
};

// execute query in cassandra
function execute(query, params, callback) {
    boundary.client.execute(query, params, {
        prepare: true
    }, function(err, result) {
        callback(err, result);
    });
}


exports.addDocWithRawData = addDocWithRawData;
exports.updateDocWithRawData = updateDocWithRawData;
exports.findAll = findAll;
exports.basicSearch = basicSearch;
exports.alive = alive;