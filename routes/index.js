var express = require('express');
var router = express.Router();
var util = require('util');
var async = require('async');
var config = require('../config.json');
var bCrypt = require('bcrypt-nodejs');

var isAuthenticated = function(req,res,next) {
	if(req.isAuthenticated())
		return next();
	res.redirect('/auth');
}
module.exports = function(passport){

 	/* GET login page. */
	router.get('/auth', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('auth', { message: req.flash('message') });
	});  

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
				successRedirect: '/',
				failureRedirect: '/auth',
				failureFlash : true  
			}));

	/* GET home page. */
	// Experiment list
	router.get('/', isAuthenticated, function(req, res) {
		var db = req.db;
		var u = req.user.username;
		console.log("USER");
		console.log(u);
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
	
	router.post('/login', passport.authenticate('login',{
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true
	}));

	router.get('/signout',function(req,res){
		req.logout();
		res.redirect('/');
	});

	// Display requested database collecion
	router.param('db2print', function(req, res, next, db2print){
		req.db2print = db2print;
		next();
	});
	router.get('/db/:db2print', isAuthenticated, function(req,res) {
		var db = req.db;
		var collection = db.collection(req.db2print);
		collection.find().sort({$natural:-1}).toArray(function(err,docs){
			res.render('results', {'data':docs, 
				          'title':'Experiment: ' + req.db2print
			});
		});
	});

	router.get('/newuser',isAuthenticated, function(req,res){
		res.render('newuser', {title:"Add new user"
		});
	});
	
	router.post('/adduser',isAuthenticated, function(req,res){
		var db = req.db;
	
		var userName = req.body.username;
		var pwd      = req.body.pwd;
	
		//encode password
		pwdEN = bCrypt.hashSync(pwd, bCrypt.genSaltSync(10), null);
	
		var collection = db.collection('Users');
	
		collection.insert({"username":userName, "pwd":pwdEN},function(err,doc){
			if (err) {
				res.send("Failed to create new user");
			}
			else {
				res.location("new user");
				res.redirect("newuser");
			}
		});
	});

	router.get('/newexp',isAuthenticated, function(req,res){
		res.render('newexp', {title:"Start new experiment"
		});
	});

	router.post('/addexp',isAuthenticated, function(req,res){
		var db = req.db;
	
		var expName = req.body.expname;
		var desc      = req.body.desc;
	
		var collection = db.collection('Experiments');

		collection.update({"_id":1},{"_id":1,"currentExp":expName, "description":desc},{upsert:true},
					function(err,doc){
						if (err) {
							res.send("Failed to create new experiment");
						}
						else {
							res.location("home");
							res.redirect("home");
						}
					});
	});
	return router;	
}

