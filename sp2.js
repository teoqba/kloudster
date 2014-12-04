var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var sp = new SerialPort("/dev/cu.usbmodem1421", {
	baudrate: 57600, parser: serialport.parsers.readline("\r\n")
});

sp.on("open", function() {
	sp.flush(function(){});
	console.log('open');
	sp.on('data', function(data){
		var json = JSON.parse(data);
		console.log(json);
	});
});


