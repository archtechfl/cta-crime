function CrimeAPI () {
	console.log("new crime API!");
	var organizeData = function (response) {
		var root = {
	    	"name": "CTA Crime Tally",
	    	"children": [],
	    	"count": 0
	    };
		_.each(response, function (item, index){
			// Create primary type objects
			var primary_type_object = {};
			primary_type_object["name"] = index;
			primary_type_object["count"] = 0;
			primary_type_object["children"] = [];
			var sub_type_collection = item["sub_types"];
			_.each(sub_type_collection, function (sub_item, sub_index){
				// Create an entry in the primary type (level 1)
				// children entry to store the number of occurences
				// of each sub type (level 2)
				var sub_type_object = {
					"name": sub_item["name"],
					"count": sub_item["count"]
				};
				primary_type_object["count"] += sub_item["count"];
				primary_type_object["children"].push(sub_type_object);
			});
			/* 
			TODO: go through the sub-type list and create a new level to contain
			any sub-types that would be difficult to discern on the graph

			This method should ideally be recursive, so that it makes yet another
			level if the last level created still has difficult to discern (DOD)
			sectors on the graph

			UPDATE: recursive is not necessary
			*/
			var primaryTypeTotal = primary_type_object["count"];
			// Consolidate sub types that are small into a larger group
			var smallBigGroup = _.partition(
				primary_type_object["children"], 
				function(sub_type){ return (sub_type["count"] / primaryTypeTotal) <= (6/360); }
			);
			// Reorganize data based on small/big pie division
			var smallGroup = smallBigGroup[0];
			var largeGroup = smallBigGroup[1];
			primary_type_object["children"] = largeGroup;
			var smallGroupSum = 0;
			_.each(smallGroup, function (smallItem, smallIndex){
				smallGroupSum += smallItem["count"];
			})
			// Create new tree for small sub-types
			var subTypeGroup = {
				"name": "OTHER " + index,
				"children": smallGroup,
				"count": smallGroupSum
			};
			primary_type_object["children"].push(subTypeGroup);
			// Add the new sub-type group to the sub_type collection
			// Build up overall crme count
			root["count"] += primary_type_object["count"]
			root["children"].push(primary_type_object);
		});
		// Subdivide the primary types based on small portions, place all the 
		// primary types with small counts into an "OTHER" top level category
		/*
		TODO: refactor this and the sub_type partition into a single method that
		can be reused
		*/
		var primaryParition = _.partition(
			root["children"], 
			function(primary_type){ return (primary_type["count"] / root["count"]) <= (6/360); }
		);
		// Reorganize data based on small/big pie division
		var smallPrimary = primaryParition[0];
		var largePrimary = primaryParition[1];
		root["children"] = largePrimary;
		var smallPrimarySum = 0;
		_.each(smallPrimary, function (primaryItem, primaryIndex){
			smallPrimarySum += primaryItem["count"];
		})
		// Create new tree for small sub-types
		var smallPrimaryGroup = {
			"name": "OTHER PRIMARY",
			"children": smallPrimary,
			"count": smallPrimarySum
		};
		root["children"].push(smallPrimaryGroup);
		// Display calls for table and D3 chart
		displayTable(root); // render the table using MustacheJS
		renderChart(root); // render the SVG chart
	};
	// Table display of crime breakdown
	var displayTable = function (dataBeforeGraph) {
		var primaryTypes = dataBeforeGraph["children"];
		// Go through each primary type and add up the sub-type counts
		var dataRenderArray = [];
		// reorganize crime data into array of objects representing primary type totals
		_.each(primaryTypes, function (item, index) {
			var primaryTypeSumObject = {};
			primaryTypeSumObject["name"] = item["name"];
			primaryTypeSumObject["count"] = item["count"];
			dataRenderArray.push(primaryTypeSumObject);
		});
		// Sort data according to count
		var sortedData = dataRenderArray.sort(function(a, b) {
            return b.count - a.count;
        });
        // render the data table for primary type totals
		var tableRender = new TableRenderer("crimeTable", "#crime_count", ".crimeCountWrapper");
		tableRender.renderTable(dataRenderArray);
	};
	// render the
	var renderChart = function (root) {
		var width = 960,
		    height = 840,
		    radius = Math.min(width, height) / 2;

		var x = d3.scale.linear()
		    .range([0, 2 * Math.PI]);

		var y = d3.scale.sqrt()
		    .range([0, radius]);

		var color = d3.scale.category20();

		// Tool tip code
		var tip = d3.tip()
		  	.attr('class', 'd3-tip')
		  	.offset([100, 100])
		  	.html(function(d) {
		  		var string = "<div class='crime-tooltip'><span class='name'>" +
		  			d.name + ": </span><span class='count'>" +
		  			d.count +
		  			"</span></div>";
		    	return string;
		  	});

		var svg = d3.select(".svg-container").append("svg")
		    .attr("width", width)
		    .attr("height", height)
		  	.append("g")
		    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

		svg.call(tip); // Tooltip call

		var partition = d3.layout.partition()
		    .value(function(d) { return d.count; });

		var sub_type_count = function(d){
			return d.count;
		};

		var sub_type_name = function(d){
			return d.name;
		};

		var sub_type_parent = function(d){
			if (d.parent){
				return d.parent.name;
			} else {
				return "NO PARENT"
			}
		};

		var arc = d3.svg.arc()
		    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
		    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

	  	var path = svg.selectAll("path")
	      	.data(partition.nodes(root))
	    	.enter().append("path")
	      	.attr("d", arc)
	      	.attr("data-count", sub_type_count)
	      	.attr("data-name", sub_type_name)
	      	.attr("data-parent", sub_type_parent)
	      	.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
	      	.on("click", click)
	      	.on('mouseover', tip.show)
      		.on('mouseout', tip.hide);

	  	function click(d) {
	  		var clickedItem = d.name;
	    	path.transition()
	      		.duration(750)
	      		.attrTween("d", arcTween(d, clickedItem));
	  	}

		d3.select(self.frameElement).style("height", height + "px");

		// Interpolate the scales!
		function arcTween(d, clickedItem) {
		 	var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
		      	yd = d3.interpolate(y.domain(), [d.y, 1]),
		      	yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
		  		return function(d, i) {
				    return i
				        ? function(t) {
				        	//console.log(t);
				        	console.log(d.parent.name);
				        	return arc(d);
				        }
				        : function(t) {
				        	//console.log(t);
				        	console.log(d.name);
				        	x.domain(xd(t));
				        	y.domain(yd(t)).range(yr(t));
				        	return arc(d);
				        };
		  		};
			}
	};
	// Get Tally method initiates data request
	this.getTally = function() {
		var getData = $.ajax({
		    url: 'cta_crime/tally',
		    type: "GET",
		    dataType: "json"
		});

		getData.done( function(response){
			organizeData(response);
		});//end of response
	};
}



