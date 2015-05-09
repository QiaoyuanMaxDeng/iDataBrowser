var boundary = require('../boundaries/boundaries')['cassandra'];
var cassandra = require('cassandra-driver');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var db = require('../databaseAPI/cassandraAPI');

var NUM_SAMPLE = 10;

// alive call to snippet server is alive
function alive(req, res){
	res.send(new AXResponse(true, moment().valueOf()));
}

// create sample data
function createSampleData (req, res){
	var errors = [];
	for (var i = 0; i < NUM_SAMPLE; i ++){
		var data = {
			'doc_title':'doc_title'+i,
			'doc_text':'doc_text'+i,
			'doc_expire':moment().add(1,'days').format('yyyy-MM-dd'),
			'doc_type':'doc_type'+i,
		}
		db.addDocWithRawData(data, function(success, results){
			errors.push({
				'success':success,
				'results':results
			});

			if (errors.length == NUM_SAMPLE){
				res.send(new AXResponse(true, '', errors));
			}
		})
	}
}

// API to get front-end UI
function get(req, res){
    var filePath = path.join(__dirname, '../../back-end/public/sample.html');
    var file = fs.readFileSync(filePath, 'utf-8');
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.write(file);
    res.end();
}

// API to add data
function addData(req, res){
	console.log(req);
	db.addDocWithRawData(req.body, function(success, result){
		res.send(new AXResponse(success, result));
	});
}

// API to get data
function getData(req, res){
	db.findAll(function(success, results){
		res.send(new AXResponse(success, results));
	});
}

// API to update date
function updateDate(req, res){
	db.updateDocWithRawData(req.body, function(success, result){
		res.send(new AXResponse(success, result));
	});
}

// API to search data
// current only supports text, expire, and type for example
function searchData(req, res){
	db.basicSearch(req.body, function(success, result){
		res.send(new AXResponse(success, result));
	})
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

exports.alive = alive;
exports.createSampleData = createSampleData;
exports.get = get;
exports.getData = getData;
exports.addData = addData;
exports.updateDate = updateDate;
exports.searchData = searchData;