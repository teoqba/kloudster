function convJSONValsToNumber(jObj){

// Iterates through JSON elements, and converts Float or Int written as String 
// to Number (Int or Float)
// TODO:
// Think how convert this to asynhronous function

	for (var i in jObj) {
		var tmp = jObj[i];
		tmp = Number(tmp);
		if (isNaN(tmp) == 0) { // if tmp == NaN means we tried to convert String to Number
			jObj[i] = tmp;
		}
	}
	return jObj;
}

exports.convJSONValsToNumber = convJSONValsToNumber;
