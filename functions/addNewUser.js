//TODO: implement on-screen information that user exists in DB
//This is most likely done through JavaScript
//See for examples:
//http://cwbuecheler.com/web/tutorials/2014/restful-web-app-node-express-mongodb/

function addNewUser(req,userData){
 	var User = require('../models/user');
	var bCrypt = require('bcrypt-nodejs');
	//Check if user exist
	
	User.findOne({username:userData.username}, function(err,user){
		if (err) {
			console.log('Error in adding user: ' + err);
			//return done(err);
		}
		// user exists
		if (user) { 
			console.log('User with the given login exists ' +
				     userData.username);
			//return done(null, false,req.flash('message',
			//		         'User exists!'));
			req.flash('message', 'User exists!');
		}
		else {
			//create new user
			var newUser = new User();

			newUser.username = userData.username;
			newUser.password = bCrypt.hashSync(userData.password, 
				                  bCrypt.genSaltSync(10),null);
			newUser.firstName = userData.name;
			newUser.lastName = userData.lname;
			newUser.phone = userData.phone;

			newUser.save(function(err) {
				if(err) {
					console.log('Error saving user: '
					       	+ err);
					throw err;
				}
				console.log('User Registration succesful');
				//return done(null, newUser);
			});
		}
	});
}

exports.addNewUser = addNewUser;
