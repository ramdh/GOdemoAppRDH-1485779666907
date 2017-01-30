/*eslint-env node*/

// This code run on the server side under Node/Express.

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------


// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// Load the Cloudant library.
var Cloudant = require('cloudant');

// Process the VCAP_SERVICES environment variables for the
// bound Cloudant service.
var vcap_services = process.env.VCAP_SERVICES;
var cloudant_services = JSON.parse(vcap_services)["cloudantNoSQLDB"][0];


// Use the VCAP variables to authenticate with Cloudant.
var cloudant = Cloudant({
	account : cloudant_services.credentials.username,
	password : cloudant_services.credentials.password
});

// var greatwest = cloudant.db.use('greatwestsports');
var greatwest = cloudant.db.use('greatoutdoors');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// This construct allows the same code to be run locally or in the cloud
var port = (process.env.VCAP_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
	console.log("server starting on " + appEnv.url);
});

// Create routes for the web page to call into

// Route to get most recent time stamp in database
app.get('/evict_ts', function(req, res) {

	// Run query to find latest TS in database
	greatwest.find({
		"selector" : {
			"evictTS" : {
				"$gt" : "0"
			},
			"storeID" : "GO-CO-001"
		},
		"fields" : [ "evictTS" ],
		"sort" : [ {
			"evictTS" : "desc"
		} ],
		"limit" : 1
	}, function(er, result) {
		if (er) {
			console.log("Find Error: ", er);
			throw er;
		}

		console.log('Found %d documents with name StoreID GO-CO-001',
				result.docs.length);
		for (var i = 0; i < result.docs.length; i++) {
			console.log('  Doc TS: %s', result.docs[i].evictTS);
		}

		// In this case we know there is only one record returned. Need to
		// investigate how to
		// receive a JSON structure and parse it.
		// NOTE: res.send sends the contents as Content-Type: text/html;
		// charset=utf-8
		// res.json sends the contents as Content-Type application/json;
		// charset=utf-8
		res.json(result.docs[0].evictTS);
		res.end;
	});
});

// Route to get shoppers for a specific time stamp
app.get('/get_shoppers', function(req, res) {

	// Run query to find latest evictTS in database
	greatwest.find({
		"selector" : {
			"evictTS" : {
				"$gt" : "0"
			},
			"storeID" : "GO-CO-001"
		},
		"fields" : [ "evictTS" ],
		"sort" : [ {
			"evictTS" : "desc"
		} ],
		"limit" : 1
	}, function(er, result) {
		if (er) {
			console.error("Error querying for evictTS: ", er);
			throw er;
		}


		if (result.docs[0]) {
			getShoppersByEvictTS(String(result.docs[0].evictTS), res);
		}
	});

	// Run query using evictTS to find latest shopper data
	function getShoppersByEvictTS(evictTSLatest, res) {
		greatwest.find({
			"selector" : {
				"evictTS" : {
					"$eq" : evictTSLatest
				},
				"storeID" : "GO-CO-001",
			},
			"fields" : [ "zoneID" ],
			"sort" : [ {
				"zoneID:number" : "desc"
			} ],
		}, function(er, result) {
			if (er) {
				console.log("Error querying for shoppers: ", er);
				throw er;
			}

			// console.log("Results of query by evictTS: ", result.docs);
			res.send(result.docs);
			res.end;

		});
	} // end function
});

// Check here to see if Cloudant contains JSON documents. If not,
// create them for use in query below. This code runs when
// Node starts not when the web page loads. See ui.js for that.

app.get('/populateDB', function(req, res) {

	var docs = {
		"docs" : [ 
{"zoneID": 992, "storeID": "GO-CO-001", "deviceId": "2", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20600", "count": 2, "ts": "2016-09-14T00:34:09.853718", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 994, "storeID": "GO-CO-001", "deviceId": "4", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20802", "count": 1, "ts": "2016-09-14T00:32:09.716564", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 995, "storeID": "GO-CO-001", "deviceId": "5", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20904", "count": 3, "ts": "2016-09-14T00:34:14.865284", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 993, "storeID": "GO-CO-001", "deviceId": "3", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20702", "count": 2, "ts": "2016-09-14T00:34:09.854511", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 995, "storeID": "GO-CO-001", "deviceId": "5", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20901", "count": 2, "ts": "2016-09-14T00:33:14.802389", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 992, "storeID": "GO-CO-001", "deviceId": "2", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20604", "count": 1, "ts": "2016-09-14T00:34:09.853718", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 995, "storeID": "GO-CO-001", "deviceId": "5", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20900", "count": 1, "ts": "2016-09-14T00:34:14.865284", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 994, "storeID": "GO-CO-001", "deviceId": "4", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20805", "count": 2, "ts": "2016-09-14T00:34:09.852889", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 993, "storeID": "GO-CO-001", "deviceId": "3", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20700", "count": 1, "ts": "2016-09-14T00:34:09.854511", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 992, "storeID": "GO-CO-001", "deviceId": "2", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20605", "count": 1, "ts": "2016-09-14T00:32:09.714737", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 993, "storeID": "GO-CO-001", "deviceId": "3", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20703", "count": 1, "ts": "2016-09-14T00:33:09.804368", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 992, "storeID": "GO-CO-001", "deviceId": "2", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20601", "count": 3, "ts": "2016-09-14T00:34:09.853718", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 993, "storeID": "GO-CO-001", "deviceId": "3", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20705", "count": 2, "ts": "2016-09-14T00:33:09.804368", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 995, "storeID": "GO-CO-001", "deviceId": "5", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20906", "count": 2, "ts": "2016-09-14T00:34:14.865284", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 991, "storeID": "GO-CO-001", "deviceId": "1", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20501", "count": 2, "ts": "2016-09-14T00:33:14.801089", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 992, "storeID": "GO-CO-001", "deviceId": "2", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20606", "count": 2, "ts": "2016-09-14T00:33:09.804900", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 991, "storeID": "GO-CO-001", "deviceId": "1", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20502", "count": 3, "ts": "2016-09-14T00:34:14.861606", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 993, "storeID": "GO-CO-001", "deviceId": "3", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20704", "count": 2, "ts": "2016-09-14T00:34:09.854511", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 995, "storeID": "GO-CO-001", "deviceId": "5", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20905", "count": 1, "ts": "2016-09-14T00:32:14.716966", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 993, "storeID": "GO-CO-001", "deviceId": "3", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20706", "count": 1, "ts": "2016-09-14T00:34:09.854511", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 991, "storeID": "GO-CO-001", "deviceId": "1", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20504", "count": 1, "ts": "2016-09-14T00:33:14.801089", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 991, "storeID": "GO-CO-001", "deviceId": "1", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20503", "count": 1, "ts": "2016-09-14T00:32:09.715113", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 992, "storeID": "GO-CO-001", "deviceId": "2", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20603", "count": 2, "ts": "2016-09-14T00:34:09.853718", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 994, "storeID": "GO-CO-001", "deviceId": "4", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20801", "count": 1, "ts": "2016-09-14T00:33:09.805947", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 991, "storeID": "GO-CO-001", "deviceId": "1", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20505", "count": 1, "ts": "2016-09-14T00:34:14.861606", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 993, "storeID": "GO-CO-001", "deviceId": "3", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20701", "count": 2, "ts": "2016-09-14T00:34:09.854511", "evictTS": "2016-09-14T00:34:54"},
{"zoneID": 994, "storeID": "GO-CO-001", "deviceId": "4", "deviceType": "GreatOutdoors",  "eventId": "status", "customerID": "20804", "count": 2, "ts": "2016-09-14T00:34:09.852889", "evictTS": "2016-09-14T00:34:54"}		                   
]
	};

	console.log("Entering function populateDB");

	// The list function returns a list of all the docs in the database - will we need to modify to count the two indices?
	
	cloudant.db.get("greatoutdoors", function(err, data) {
		console.log("Row count:", data.doc_count);
			if (err) {
				console.log("List Error: ", err);
				throw err;
			}
			
			// If documents exist then do not do anything
			// If only 2 docs exist then those are the 2 indexes...we need to populate the database.
			if (data.doc_count == 2) {
				console.log("No documents found in database");
				console.log("Generating JSON data documents...")
				greatwest.bulk(docs, {
					success : function(resp) {
						// success callback
					},
					error : function(resp, textStatus, errorThrown) {
						// error callback
					}
				});
			}
			});
});