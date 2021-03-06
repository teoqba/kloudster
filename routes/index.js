var express = require('express');
var router = express.Router();
var util = require('util');
var async = require('async');
var config = require('../config.json');
var bCrypt = require('bcrypt-nodejs');
var addNewUser = require('../functions/addNewUser');
var moment = require('moment');
var plotly = require('plotly')("teoqba", "zxkvkkvv6b");
var plotF = require('../functions/plotF');

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

	router.get('/signout',function(req,res){
		req.logout();
		res.redirect('/');
	});

	/* GET home page. */
	// Experiment list
	router.get('/', isAuthenticated, function(req, res) {

		var user = req.user.username;
		var db = req.db;
		var collection = db.collection('Experiments');

		collection.find({'userid':user}).toArray(function(err,docs){
			if (err) {  
				res.send("Error retrieving collecton Experiments");
				console.log("Error getting Experiments" + err);
			}
			else{
				res.render('index',{'data':docs,'title':'Past Experiments',
					   'titleLive': 'LIVE! Now',
					   'devices':['','sparky'],
					    'eTypes':['',"Community","Private"]
				});
			}
		});
	});
					
	// Display requested database collecion
	router.param('db2print', function(req, res, next, db2print){
		req.db2print = db2print;
		next();
	});
	router.get('/db/:db2print', isAuthenticated, function(req,res) {
		var db = req.db;
		var collection = db.collection('Experiments');
		//Choose proper jade template to render
		if (req.db2print == "TempHumidity") {
			var renTemplate = 'results-rh';
//			plotURL = plotF(req);
//			console.log(plotURL);
		}
		else {
			var renTemplate = 'results-def';
		}
		collection.findOne({'userid':req.user.username,'expname':req.db2print},
			function(err,docs1){
				if (err) {
					console.log('Error retrieving functions: ' + err);
				}
				else {
					var functions = docs1.functions;
					if (docs1.functions == undefined) {
						functions = 0;}
					var collection = db.collection('Data');
					collection.find({'userid':req.user.username,'expname':req.db2print})
		                	.sort({$natural:-1}).toArray(function(err,docs){
						res.render(renTemplate, {'data':docs,'functions':functions,
					        	  'title': req.db2print
						});
					});
				}
		});
	});

	router.get('/newuser', isAuthenticated,function(req,res){
		res.render('newuser', {title:"Add new user"
		});
	});
	
	router.post('/adduser', isAuthenticated, function(req,res){
		var userData = {username:req.body.username,
		   	        password:req.body.password,
		                name:req.body.name,
		                lname:req.body.lname,
		                phone:req.body.phone};

		//console.log(addNewUser);
		addNewUser.addNewUser(req,userData);
			
		res.location("new user");
		res.redirect("newuser");
	});

	router.post('/addexp',isAuthenticated, function(req,res,next){

		var db = req.db;
		var collection = db.collection('Experiments');

		var username = req.user.username;
		
		var item ={"userid":username, "expname":req.body.expname, 
			   "description":req.body.desc, 
		           "exptype":req.body.expType,
			   "device":req.body.dev,
			   "created_on":new Date(),
			   "live":1};
		
		// Device type and Experiment type need to be given
		// Redirect back otherwise
		var device = req.body.dev;
		var type = req.body.expType;
	        if (device=="" || type=="") {
			res.redirect("/");
			return next();
		}
		collection.update({"userid":username,"device":req.body.dev,"live":1},
			          {$set:{"live":0}}, function(err,doc){
			if (err) {
				res.send("Failed shut down live Experiment: " 
					+ err);
			}
			else {
				collection.insert(item,function(err,doc){
					if (err) {
					        res.send('Failed to insert new Experiment: '+err);
					}
					else{
						res.location('/');
						res.redirect('/');
					}
			        });
			}
		});
	});

	router.get('/newdevice', isAuthenticated, function(req,res){
		res.render('newdevice', {title:'Add new device'
		});
	});

	router.post('/adddev',isAuthenticated, function(req,res,next){

		var db = req.db;
		var collection = db.collection('Devices');

		var username = req.user.username;
		var item = {'userid': username, 'deviceid':req.body.devname};

		collection.insert(item,function(err,doc) {
			if (err) {
				res.send('Failed do add new device: ' + err);
			}
			else {
				res.location('/');
				res.redirect('/');
			}
		});
	});
	//Manage experiments: stop, resume, delete
	router.post('/expmng', isAuthenticated, function(req,res){
		var userid = req.user.username;
		var db = req.db;
		var collection = db.collection('Experiments');
		if (req.body.expname_stop) {
			var expname = req.body.expname_stop;
			var action = "stop";
			collection.update({"userid":userid,"expname":expname,"live":1},
				          {$set:{"live":0}},function(err,docs){
				if (err){
					res.send("Error stoping experiment: "+err);
				}
			});
		}
		if  (req.body.expname_res) {
			var expname = req.body.expname_res;
			var action = "resume";
		        // To resume the experiment, find first the expetiment that is 
			// running on the same device and stop it first	
			collection.findOne({'userid':userid,'expname':expname,'live':0},
				          function(err,docs){
				if (err) {
					res.send('Error finding eperiment: '+err);
				}
				else {
					// Get the device name of the experiment to be resumed
					var deviceid = docs.device;
					collection.update({'userid':userid, 'device':deviceid, 'live':1},
						{$set:{'live':0}},function(err,docs){
						if (err) {
							res.send('Error stopping experiment: '+err);
						}
						else {
							collection.update({'userid':userid,'expname':expname,'live':0},
							{$set:{'live':1}},function(err,docs){
								if (err) {
									res.send('Error resuming expriment: ' + err);
								}
							});
						}
					});
				}
			});
		}
		if (req.body.expname_del) {
			var expname = req.body.expname_del;
			var action = "delete";
			collection.remove({"userid":userid,"expname":expname,"live":0},
				          function(err,docs){
				if (err){
					res.send("Error removing experiment: "+err);
				}
				else {
					var collection = db.collection('Data');
					collection.remove({"userid":userid,"expname":expname},
						          function(err,docs){
						if (err) {
							res.send("Error removing data for experiment: "+err);
						}
					});
				}
			});
		}
		res.location("/");
		res.redirect("/");
	});

	//Check for exposed Spark functions
	router.post('/controlCheck',isAuthenticated, function(req,res,next){
		var username = req.user.username;
		var expname = req.body.expname;
		var db = req.db;
		var spark = req.sparkID;
		//Find the device running this experiment
		collection = db.collection('Experiments');
		collection.findOne({'userid':username,'expname':expname},function(err,docs){
			if (err) {
				res.send('Error retrieving experiment: '+err);
			}
			else {
				var device = docs.device;
				var devicesPr = spark.getAttributesForAll();
				devicesPr.then(function(data){
					for (i=0; i<data.length;i++){
						if (data[i].name == device){
							var funcs = data[i].functions;
						}
					}
					collection.update({'userid':username,'expname':expname,'device':device,'live':1},
						          {$set:{'functions':funcs}},function(err,docs2){
						if (err) {
							res.send('Cannot update functions :' + err);
						}
						else {
							res.location("db/"+req.body.expname);
							res.redirect("db/"+req.body.expname);
						}
					});
				});
			}
		});
	});

	router.post('/toggleAction',isAuthenticated, function(req,res,next){
		var username = req.user.username;
		var expname = req.body.expname;
		var db = req.db;

		if (req.body.fOn) {
			var action = 'on';
			var fname = req.body.fOn;
		}
		if (req.body.fOff) {
			var action = 'off';
			var fname = req.body.fOff;
		}
		var spark = req.sparkID;
		//Find the device running this experiment
		collection = db.collection('Experiments');
		collection.findOne({'userid':username,'expname':expname},function(err,docs){
			if (err) {
				res.send('Error retrieving experiment: '+err);
			}
			else {
				var device = docs.device;
				spark.listDevices(function(err,devices) {
					for (i=0; i<devices.length;i++){
						if (devices[i].name == device){
							console.log(devices[i]);
							devices[i].callFunction(fname, action, function(err,data) {
								if (err) {
									console.log('Error while sending function: '+err);
								}
								else {
								res.location("db/"+req.body.expname);
								res.redirect("db/"+req.body.expname);
								}
							});
						}
					}
				});
			}
		});
	});

	//plot temperature
	router.post('/plotTemp',isAuthenticated, function(req,res,next){
		var username = req.user.username;
		var expname = req.body.expname;
		var db = req.db;
		var spark = req.sparkID;
		//Find the device running this experiment
		collection = db.collection('DataEmb');
		collection.findOne({'userid':username,'expname':expname},function(err,docs){
			if (err) {
				res.send('Error retrieving experiment: '+err);
			}
			else {
				var values = docs.values;
				var values2 = docs.values2;
				var xx = Object.keys(values);
				yy=[];
				var xx2 = Object.keys(values2);
				yy2=[];

				for (v in values) {
					yy.push(values[v]);
				}
				for (v in values2) {
					yy2.push(values2[v]);
				}
				var trace1 = {x:xx,y:yy,type:"scatter"};
				var trace2 = {x:xx2,y:yy2,type:"scatter",yaxis:"y2"};
				var data = [trace1, trace2];
				var layout = {xaxis:{nticks:4,tickfont:{size:10}},
					      yaxis:{title:"Temperature [C]"},
					      yaxis2:{title: "Rel. Humidity [%]",side:"right",overlaying: "y"}};
				var graphOptions = {layout:layout, filename: "date-axes", fileopt: "overwrite"};
				plotly.plot(data, graphOptions, function (err, msg) {
					    console.log(msg);
				});
				res.location("db/"+req.body.expname);
				res.redirect("db/"+req.body.expname);
			}
		});
	});

	return router;	
}

