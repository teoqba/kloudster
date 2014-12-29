var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sendTextMessage = require('./functions/sendTextMessage');
var convJSONValsToNumber = require('./functions/convJSONValsToNumber');
var fs = require('fs');
var spark = require('spark');


// Spark Core + Twilio
var twilio = require('twilio');
if (!fs.existsSync('./config.json')) {
	console.error('Please create a config.json -- check config.json.sample');
	process.exit();
}

var config = require('./config.json');

spark.login({accessToken:config.sparkAccessToken});
// Mongo
var mongo = require('mongoskin');
var dbAddress = 'mongodb://' + config.dbUser + ':' + config.dbPwd +
                 '@localhost:27017/' + config.dbName;
var db = mongo.db(dbAddress,{native_parser:true});
//var db = mongo.db('mongodb://localhost:27017/testDB');
//var db = mongo.db('mongodb://sparkLog:SparkKloudster@localhost:27017/testDB',{native_parser:true});

//Mongoose for Passport
var dbConfig = require('./dbm');
var mongoose = require('mongoose');
// Connect to DB
mongoose.connect(dbConfig.url);

//Twilio setup
var twilioClient = require('twilio')(config.twilioAccountSID, 
		                    config.twilioAuthToken);

var app = express();

app.locals.moment = require('moment');

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

// Configure passport
// Based on: http://code.tutsplus.com/tutorials/authenticating-nodejs-applications-with-passport--cms-21619

var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
var flash = require('connect-flash');
app.use(flash());
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
spark.listDevices().then(function(devices){
	devices[0].onEvent('meas',function(data){
	console.log('Got Event');
	var collection = db.collection('Experiments');
	collection.findOne({'device':'sparky','live':1},function(err,docs){
		if (err) {
			console.log("Coudn't find device: " + err);
		}
		else if (!docs)
			console.log("No live experiments or coudn't find device");
		else{
			var jData = JSON.parse(data.data);
			jData = convJSONValsToNumber.convJSONValsToNumber(jData);
			jData.logged_on = new Date();
			jData.userid = docs.userid;
			jData.expname = docs.expname;
			var collection = db.collection('Data');
			collection.insert(jData, function(err,doc) {
				if (err){
					console.log("Problem inserting data"+ err);
				}
			});
		}
	});
});
});

app.use(function(req, res, next){
	req.db = db;
	next();
});
app.use(function(req, res, next){
	req.sparkID = spark;
	next();
});

app.use('/', routes);

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
