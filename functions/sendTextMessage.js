function sendTextMessage(message) {
	twilioClient.sendMessage({
		to: config.smsToPhoneNumber,
		from: config.smsFromPhoneNumber,
		body: message
	}, function(err, responseData) {
		if (err) {
		console.error(err);
	} else {
		console.log("'" + message + "' sent to " + config.smsToPhoneNumber);
	}
	});
}

exports.sendTextMessage = sendTextMessage;
