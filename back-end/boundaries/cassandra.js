'use strict';

var cassandra = require('cassandra-driver');
var config = require('../config/cassandra');
var debug = require('debug')('cassandra');
var client = null;

module.exports = CassandraBoundary;

function CassandraBoundary() {
    // initialize a cassandra connection
    if (this.client == null){
		this.client = new cassandra.Client({
            contactPoints : config.hosts,
            keyspace : config.keyspace,
            authProvider : new cassandra.auth.PlainTextAuthProvider(config.username, config.password)
        });
		console.log("CassandraBoundary is running.");

        this.client.on('log', function(level, className, message, furtherInfo) {
            debug('log event: %s -- %s', level, message);
            if(furtherInfo)
                debug('log furtherInfo: %s', furtherInfo);
        });	
    }
}