var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var getDateTime = require('./getDateTime');
var sendTextMessage= require('./sendTextMessage');
var fs = require('fs');

//Serial port stuff
//var serialport = require("serialport");
//var SerialPort = serialport.SerialPort;
//var sp = new SerialPort("/dev/cu.usbmodem1421", {
//	baudrate: 57600, parser: serialport.parsers.readline("\r\n")
//});

// Spark Core + Twilio
var spark = require('sparknode');
var twilio = require('twilio');
if (!fs.existsSync('./config.json')) {
	console.error('Please create a config.json -- check config.json.sample');
	process.exit();
}

var config = require('./config.json');

// Mongo
var mongo = require('mongoskin');
var dbAddress = 'mongodb://' + config.dbUser + ':' + config.dbPwd +
                 '@localhost:27017/' + config.dbName;
var db = mongo.db(dbAddress,{native_parser:true});

//var db = mongo.db('mongodb://sparkLog:SparkKloudster@localhost:27017/testDB',{native_parser:true});

var routes = require('./routes/index');
var users = require('./routes/users');

// Spark setup
var core = new spark.Core({
	accessToken: config.sparkAccessToken,
        id: config.sparkDeviceID
});

//Twilio setup
var twilioClien = require('twilio')(config.twilioAccountSID, 
		                    config.twilioAuthToken);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/*
sp.on("open", function() {
	sp.flush(function(){});
	console.log('open');
	sp.on('data', function(data){
		var collection = db.collection('datapoints');
		collection.insert(JSON.parse(data),function(err,doc) {
			if (err){
				conslole.log("INSERTION");
			}
		});
	});
});
*/

core.on('meas', function(data) {
	console.log('Got Event');
	var totd = getDateTime.getDateTime();
	var jData = JSON.parse(data.data);
	jData.totd = totd.totd;
	var collection = db.collection(config.collection);
	collection.insert(jData, function(err,doc) {
		if (err){
			console.log("Problem inserting data"+ err);
		}
	});
});

core.on('alarm', function(data) {
	sendTextMessage("Spark Core RESET");
});

app.use(function(req, res, next){
	req.db = db;
	next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
