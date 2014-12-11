var express = require('express');
var router = express.Router();
var util = require('util');
var async = require('async');
var config = require('../config.json');
/* GET home page. */
/*router.get('/', function(req, res) {
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
*/
router.get('/', function(req, res) {
	var db = req.db;
	var collection = db.collection(config.collection);
	collection.find().toArray(function(err,docs){
		res.render('index',{title:'Counter test','data':docs 
		});
	});
});

router.get('/rh',function(req,res) {
	var db = req.db;
	var collection = db.collection(config.collection);
	collection.find().toArray(function(err,docs){
		res.render('rh', {'data':docs, 'title':'RH in Silicon'
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
		res.render('rh', {'data':docs, 
			          'title':'Experiment: ' + req.db2print
		});
	});
});
// Experiment list
router.get('/testlib', function(req, res) {
	var db = req.db;
	db.collectionNames(function(err,items){
		var cleanCollList = {};
		var liveColl ={};  //current experiment
		var liveIndex = 0; //index of current experiment
		var asyncArray = []; //for async module, will contain collection names
		var index = 0;
		for (var i=0;i<items.length; ++i){
			if (items[i].name != config.dbName+'.system.indexes'){
				//remove database name from collection name
				var tmp = items[i].name;
				tmp = tmp.split(".");
				items[i].name = tmp[1];
				asyncArray.push(tmp[1])
				if (tmp[1] == config.collection){
					liveColl[0] = items[i];}
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
				console.log(i);
				if (results[i].length == 0){
					var desc ='None';}
				else{
					var desc = results[i][0].description;}
				cleanCollList[i].description = desc;
			}
			res.render('testlib', {'data':cleanCollList,'title':'Available Experiments'
			});
		});
	});
});



module.exports = router;
