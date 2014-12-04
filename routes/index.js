var express = require('express');
var router = express.Router();
var util = require('util');
/* GET home page. */
router.get('/', function(req, res) {
	var db = req.db;
	var collection = db.collection('datapoints');
	collection.find().toArray(function(err, docs){
 		res.render('index', {'data': docs, 'title':'Datapoints'
       		});
	});
});

module.exports = router;
