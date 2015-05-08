var express = require('express');
var app = module.exports = express();
var router = express.Router();
var dataInteractor = require('../interactors/data-interactor');


/* GET request*/
router.get('/alive',dataInteractor.alive);
router.get('/all', dataInteractor.findAll);

/* POST request */
router.post('/add', dataInteractor.addDocWithRawData);
router.post('/update', dataInteractor.updateDocWithRawData);
router.post('/search', dataInteractor.basicSearch);

module.exports = router;
