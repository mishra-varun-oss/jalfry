const crypto = require('crypto');

module.exports.new_pin = () => {
	var length = 8,
	charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
	retVal = "";
	
	for (var i = 0, n = charset.length; i < length; ++i) {
		retVal += charset.charAt(Math.floor(Math.random() * n));
	}
	
	return retVal;
}
module.exports.generate_challenge = () => {
	let array = crypto.randomBytes(8);
	return array.toString('base64');
}

