/**
 * This is where the code goes for the UI
 */

$(document).ready(
		function() {

			// Populate the Cloudant database if it is empty
			populateDatabase();
			
			// create an array zones to contain the number of shoppers
			// in each zone
			zones = [ 2, 4, 2, 1, 3 ];
			
			// Create store list dropdown using jQuery
			// This data will be generated programmatically in the future
			var storedata = {
				'GO-CO-001' : 'GO-CO-001',
				'GO-CO-002' : 'GO-CO-002',
				'GO-CO-003' : 'GO-CO-003',
				'GO-CO-004' : 'GO-CO-004',
				'GO-CO-005' : 'GO-CO-005',
				'GO-CO-006' : 'GO-CO-006',
				'GO-CO-007' : 'GO-CO-007',
				'GO-CO-008' : 'GO-CO-008',
				'GO-CO-009' : 'GO-CO-009'
			};

			var s = $('<select name="stores" id="stores"/>');

			for ( var val in storedata) {
				$('<option />', {
					value : val,
					text : storedata[val]
				}).appendTo(s);
			}

			// Append the dropdown to the HTML form
			s.appendTo('#gui1_form');


			var chart = nv.models.discreteBarChart().x(function(d) {
				return d.label
			}) // Specify the data accessors.
			.y(function(d) {
				return d.value
			}).staggerLabels(true) 	// Staggering labels here for small screens (e.g. mobile)
			.tooltips(false) // Don't show tooltips
			.showValues(true); // ...instead, show the bar value right on top
			// of each bar.

			function draw(){	
				d3.select('#data1 svg')
				.datum(shopperData())
				.transition(500)
				.duration(500)
				.call(chart);

				nv.utils.windowResize(chart.update);

				return chart;
			};



			// REST endpoint to query Cloudant for Shoppers in each zone.
			function shopperData() {
								
				$.getJSON("/get_shoppers", function(data) {

					// clear previous zone data to prevent incrementation of values
					zones = [ 0, 0, 0, 0, 0 ];
					
					// Get the shopper data JSON in convert it to an array of
					// zones containing the number of shoppers in each zone.
					for (var i = 0; i < data.length; i++) {

						// increment the number of shoppers in the zone
						zones[data[i].zoneID - 991]++;
					}
					// IMPORTANT!  This causes this function to run synchronously.  Not a big deal if we are only running a few stores.
					//	This should be changed to async if we begin to view multiple stores at one time.
					async:false

				});
				
				
				return [ {
					key : "Cumulative Return",
					values : [ {
						"label" : "Zone 991",
						"value" : zones[0]
					}, {
						"label" : "Zone 992",
						"value" : zones[1]
					}, {
						"label" : "Zone 993",
						"value" : zones[2]
					}, {
						"label" : "Zone 994",
						"value" : zones[3]
					}, {
						"label" : "Zone 995",
						"value" : zones[4]
					}

					]
				} ];
				
			};  // end shopperData()
			
			
			
			// This version returns only the array of shoppers.
			function shopperDataLite() {
				
				var internal_zones = [ 0, 0, 0, 0, 0 ];
				
				$.getJSON("/get_shoppers", function(data) {								
					
					// Get the shopper data JSON in convert it to an array of
					// zones containing the number of shoppers in each zone.
					for (var i = 0; i < data.length; i++) {

						// increment the number of shoppers in the zone
						// the "zoneID -1" part is allowing us to index off of the zone number
						//  Since zoneIDs are 991 to 995 we need to subtract off 991 to find index 0. 
						internal_zones[data[i].zoneID - 991]++;
					}
				
					// IMPORTANT!  This causes this function to run synchronously.
					async:false

				});
								
				return internal_zones;
			};  // end shopperDataLite()
			
			// This function checks to see if the database is populated.
			function populateDatabase() {

				$.getJSON("/populateDB", function(data) {});

			}; // end populateDatabase()


			
			// Draw chart the first time....
			draw();

			
			// Redraw the data upon a set interval
			setInterval(function() {
				// reset zones values to zero to prevent incrementation.   Would need to
				//	refactor if used for anything but a demo.
				draw();
				//zones = [ 0, 0, 0, 0, 0 ];
				
			}, 1000*30);
			
		});  // documentReady