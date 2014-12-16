var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
		id: String,
		username: String,
		pwd: String,
		email: String,
		firstName: String,
		lastName: String
},'Users');
