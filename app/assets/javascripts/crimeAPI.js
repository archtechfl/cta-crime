function CrimeAPI () {
	console.log("new crime API!");
}

CrimeAPI.prototype.getTally = function() {
	var getData = $.ajax({
	    url: 'cta_crime/tally',
	    type: "GET",
	    dataType: "json"
	});

	getData.done( function(response){
		var root = {
	    	"name": "CTA Crime Tally",
	    	"children": []
	    };
		_.each(response, function (item, index){
			// Create primary type objects
			var primary_type_object = {};
			primary_type_object["name"] = index;
			primary_type_object["children"] = [];
			var sub_type_collection = item["sub_types"];
			_.each(sub_type_collection, function (sub_item, sub_index){
				// Create an entry in the primary type
				// children entry to store the number of occurences
				// of each sub type
				var sub_type_object = {
					"name": sub_item["name"],
					"count": sub_item["count"]
				};
				primary_type_object["children"].push(sub_type_object);
			});
			root["children"].push(primary_type_object);
		});
		console.log(root);

	    var width = 960,
		    height = 700,
		    radius = Math.min(width, height) / 2;

		var x = d3.scale.linear()
		    .range([0, 2 * Math.PI]);

		var y = d3.scale.sqrt()
		    .range([0, radius]);

		var color = d3.scale.category20c();

		var svg = d3.select("body").append("svg")
		    .attr("width", width)
		    .attr("height", height)
		  .append("g")
		    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

		var partition = d3.layout.partition()
		    .value(function(d) { return d.count; });

		var arc = d3.svg.arc()
		    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
		    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

	  	var path = svg.selectAll("path")
	      	.data(partition.nodes(root))
	    .enter().append("path")
	      	.attr("d", arc)
	      	.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
	      	.on("click", click);

	  	function click(d) {
	    	path.transition()
	      		.duration(750)
	      		.attrTween("d", arcTween(d));
	  	}

		d3.select(self.frameElement).style("height", height + "px");

		// Interpolate the scales!
		function arcTween(d) {
		  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
		      yd = d3.interpolate(y.domain(), [d.y, 1]),
		      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
		  return function(d, i) {
		    return i
		        ? function(t) { return arc(d); }
		        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
		  };
		}
	});//end of response
};