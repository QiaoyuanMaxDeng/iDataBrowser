'use strict';
var express = require('express');
var app = module.exports = express();
var bodyParser = require('body-parser')
var browserRouter = require('./routes/browserRouter');
var router = express.Router();
var path = require('path');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// Enables CORS
var enableCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use('/public', express.static(path.join(__dirname, '/back-end/public')));
app.use(enableCORS);
app.use('/',browserRouter);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(new AXResponse(false, err.message, err));
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});

function AXResponse(success, message, payload) {
    this.success = success || false;
    this.message = message || null;
    this.payload = payload || null;
};