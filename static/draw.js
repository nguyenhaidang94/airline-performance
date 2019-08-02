var width = 960;
var height = 600;
var svg = d3.select("div.graphic").append("svg")
	.attr("width", width)
	.attr("height", height);

var projection = d3.geoAlbersUsa()
					.translate([width/2, height/2])
					.scale([1000]);
var path = d3.geoPath(projection);

var map = svg.append("g");
d3.json("http://127.0.0.1:5000/static/us-states.json").then(function(json) {
	map.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "state");
});

function getProjectedPoint(projector, airport){
	projectedPoint = projector([airport.origin_long, airport.origin_lat]);
	if (projectedPoint == null){
		// return an empty point
		return [-10,-10];
	}
	return projectedPoint;
}

function drawRoutes(routeGraph, projector, origin, dests){
	var projectedOrigin = projector([origin.origin_long, origin.origin_lat]);
	var projectedDests = []
	for (dest of dests){
		var projectedDest = projector([dest.origin_long, dest.origin_lat]);
		projectedDests.push(projectedDest);
	}
	// remove old lines
	routeGraph.selectAll("line").remove();
	// draw new lines
	routeGraph.selectAll("line")
		.data(projectedDests)
		.enter()
		.append("line")
		.attr('x1', projectedOrigin[0])
		.attr('y1', projectedOrigin[1])
		.attr('x2', function(item){return item[0];})
		.attr('y2', function(item){return item[1];})
		.attr("class", "route");
}

function airportOnClick(routeGraph, projector, airport){
	$.ajax({
		url: "http://127.0.0.1:5000/delayed-route/"+airport.ORIGIN,
		success: function(response){
			dests = response;
			drawRoutes(routeGraph, projector, airport, dests);
		},
		error: function(response){
			console.log("request error");
		}
	});
}

var airport = svg.append("g");
var route = svg.append("g");
d3.csv("http://127.0.0.1:5000/static/us_airports.csv").then(function(data){
	airport.selectAll("circleOrigin")
		.data(data)
		.enter()
		.append("circle")
		.attr('cx', function (item) { return getProjectedPoint(projection, item)[0]; })
		.attr('cy', function (item) { return getProjectedPoint(projection, item)[1]; })
		.attr('name', function (item) { return item.ORIGIN;})
		.attr('r', '3px')
		.attr('class', 'airport')
		.on("click", function(item){ airportOnClick(route, projection, item)});
});
