var express = require('express');
var router = express.Router();
var util = require('util');
/* GET home page. */
router.get('/', function(req, res) {
	var db = req.db;
	var collection = db.collection('datapoints');
	collection.find().toArray(function(err, docs){
		db.collectionNames(function(err,items){
		var cleanCollList = {};
		for (var i=0;i<items.length; ++i){
			console.log(items[i].name);
			if (items[i].name != 'k1test.k1test' && 
   			    items[i].name != 'k1test.system.indexes'){
				cleanCollList[i]=items[i];
			}
		}
		res.render('colls', {'data':docs,'title':'Datapoints',
			'data2':cleanCollList
		});
		});
	});
});

router.get('/rh',function(req,res) {
	var db = req.db;
	var collection = db.collection('SiliconMes');
	collection.find().toArray(function(err,docs){
		res.render('rh', {'data':docs, 'title':'RH in Silicon'
		});
	});
});
module.exports = router;
