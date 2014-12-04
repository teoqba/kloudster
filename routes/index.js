var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	var db = req.db;
	var collection = db.get('datapoints');
	collection.find({},{},function(err, docs){
 		res.render('index', {'data': docs, 'title':'Datapoints'
       		});
	});
});

module.exports = router;
