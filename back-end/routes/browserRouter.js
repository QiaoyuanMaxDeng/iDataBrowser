var express = require('express');
var app = module.exports = express();
var router = express.Router();
var browserInteractor = require('../interactors/browser-interactor');


/* GET request*/
router.get('/alive',browserInteractor.alive);
router.get('/get', browserInteractor.get);
router.get('/get-data', browserInteractor.getData);
router.get('/create-samples',browserInteractor.createSampleData);

/* POST request */
router.post('/add', browserInteractor.addData);
router.post('/update', browserInteractor.updateDate);
router.post('/basic-search', browserInteractor.searchData);

module.exports = router;
