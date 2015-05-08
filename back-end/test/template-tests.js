
var request = require('supertest')
    , app = require('../app');

describe('an unknown route should', function(){
    it('respond with 404 and JSON', function(done){
        request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect({ 'success' : false,
            'message' : 'Not Found',
            'metadata' : null,
            'payload' : { 'status' : 404 }
        })
        .expect(404, done);
    });
});

