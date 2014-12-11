var express = require('express');
var router = express.Router();
var util = require('util');
var async = require('async');
var config = require('../config.json');
/* GET home page. */
// Experiment list
router.get('/', function(req, res) {
	var db = req.db;
	db.collectionNames(function(err,items){
		var cleanCollList = {};
		var asyncArray = []; //for async module, will contain collection names
		var index = 0;
		var indexLive= 0; //index of current experiment
		for (var i=0;i<items.length; ++i){
			if (items[i].name != config.dbName+'.system.indexes'){
				//remove database name from collection name
				var tmp = items[i].name;
				tmp = tmp.split(".");
				items[i].name = tmp[1];
				asyncArray.push(tmp[1])
				//save index of current experiment
				if (tmp[1] == config.collection) indexLive = index;
				cleanCollList[index]=items[i];
				index += 1;
			}
		}
		//Use async module to retrive description from all collections
 		//simultaneously 
		var findDescription = function(coll,callback){
			db.collection(coll).find
                                            ({"description":{$exists:true}}).toArray(callback);}
			async.map(asyncArray, findDescription, function(err, results){
			for (var i in results){
				if (results[i].length == 0){
					var desc ='None';}
				else{
					var desc = results[i][0].description;}
				cleanCollList[i].description = desc;
				cleanCollList[i].live = 0; //it not currently going experiment
				if (i == indexLive) cleanCollList[i].live = 1; //it is currenty going experiment
				
			}
			res.render('index', {'data':cleanCollList,'title':'Past Experiments',
				               'titleLive':'Ongoing Experiment'
			});
		});
	});
});



router.get('/', function(req, res) {
	var db = req.db;
	var collection = db.collection(config.collection);
	collection.find().toArray(function(err,docs){
		res.render('index',{title:'Counter test','data':docs 
		});
	});
});

// Display requested database collecion
router.param('db2print', function(req, res, next, db2print){
	req.db2print = db2print;
	next();
});
router.get('/db/:db2print', function(req,res) {
	var db = req.db;
	var collection = db.collection(req.db2print);
	collection.find().toArray(function(err,docs){
		res.render('results', {'data':docs, 
			          'title':'Experiment: ' + req.db2print
		});
	});
});

/*
router.get('/rh',function(req,res) {
	var db = req.db;
	var collection = db.collection(config.collection);
	collection.find().toArray(function(err,docs){
		res.render('rh', {'data':docs, 'title':'Experiment: ' + config.collection
		});
	});
});
*/


module.exports = router;
