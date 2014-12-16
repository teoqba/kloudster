var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
//var mongo = require('mongoskin');
//var config = require('../config.json');
//var dbAddress = 'mongodb://' + config.dbUser + ':' + config.dbPwd +
//                 '@localhost:27017/' + config.dbName;
//var db = mongo.db(dbAddress,{native_parser:true});
var User = require('../models/user');

module.exports = function(passport){

	passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
    	    User.findOne({'username' : username},
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        console.log('User Not Found with username '+username);
                        return done(null, false, req.flash('message', 'User Not found.'));                 
                    }
                    // User exists but wrong password, log the error 
                    if (!isValidPassword(user, password)){
                        console.log('Invalid Password');
                        return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
                    return done(null, user);
                }
            );

        })
    );


    var isValidPassword = function(user, password){
	    console.log(user);
	    console.log(password);
	    console.log(user.pwd);
        return bCrypt.compareSync(password, user.pwd);
    }
    
}