var plotly = require('plotly')("teoqba", "zxkvkkvv6b");

function plotF(req){
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
				    var plotURL = msg.url;
				    return plotURL;
			});
		}
	});
}

exports.plotF = plotF;
