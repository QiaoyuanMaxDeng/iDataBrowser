// this module holds the global singleton boundary objects
var cassandraBoundary = require('./cassandra');

function Boundaries() {
    // do any initialization for the application's boundaries here
    if(!this.cassandra) {
        this.cassandra = new cassandraBoundary();
    }
}

var boundaries = new Boundaries();

module.exports = {
    'cassandra' : boundaries.cassandra,
};
