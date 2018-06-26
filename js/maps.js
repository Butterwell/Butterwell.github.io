var width = 960,
    height = 500;

var projection = d3.geoOrthographic()
    .scale(248)
    .clipAngle(90);

var path = d3.geoPath()
    .projection(projection);

var graticule = d3.geoGraticule()
    .extent([[-180, -90], [180 - .1, 90 - .1]]);

var voronoi = d3.voronoi()
    .extent([[-1, -1], [width + 1, height + 1]]);

var svg = d3.select("body").append("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("width", width)
    .attr("height", height);

var line = svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

// Container for station points to preserve write (overlay) order
svg.append("g")
     .attr("id", "points")

var title = svg.append("text")
    .attr("x", (width / 2)+3)
    .attr("y", (height / 2)+3);

var rotate = d3_geo_greatArcInterpolator();

var i = -1

d3.queue()
    .defer(d3.json, "world-110m.json")
    .defer(d3.json, "station.json")
    .await(ready);

var stations;
function ready(error, world, stations) {

  var defs = svg.append("defs");

  defs.append("path")
      .attr("id", "land")
      .datum(topojson.feature(world, world.objects.land))
      .attr("d", path);

  var land = svg.select("#land")

  defs.append("clipPath")
      .attr("id", "clip")
    .append("use")
      .attr("xlink:href", "#land");

  svg.append("g")
     .attr("id", "vor")
     .attr("clip-path", "url(#clip)")

  var countries = topojson.feature(world, world.objects.countries).features

  path.pointRadius(function(f,j){
      return j==i?7:3
  });

  var country = svg.selectAll(".country")
      .data(countries)
    .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path);

  var usaCenter = [-98.5795, 39.8283]

  rotate.source(projection.rotate()).target([-usaCenter[0], -usaCenter[1]]).distance();

  projection.rotate(rotate(1));
  projection.scale(248*3+(4*Math.abs(Math.cos(Math.PI))));
  country.attr("d", path);
  line.attr("d", path);
  land.attr("d", path);

  var station = svg.select("#points").selectAll(".station")
        .data(stations)
      .enter().insert("path")
        .attr("class", "station")
        .attr("d", path);

  var vors = stations.map(function(s) {
      return projection(s.coordinates)
  })

  function renderCell(d) {
      return d ? "M" + d.join("L") + "Z" : null;
  }

  var vor = svg.select("#vor").selectAll(".station-cell")
      .data(voronoi.polygons(vors))
    .enter().insert("path")
      .attr("class", "station-cell")
      .attr("d", renderCell);

  step()

  function step() {
    if (++i >= stations.length) i = 0;
    title.text(stations[i].name+" "+stations[i].mindate);

    var point = d3.geoPath()
        .centroid(stations[i]);

    d3.transition()
        .delay(250)
        .duration(1250)
        .tween("rotate", function() {
          rotate.source(projection.rotate()).target([-point[0], -point[1]]).distance();
          return function(t) {
            projection.rotate(rotate(t));
            projection.scale(248*3+(4*Math.abs(Math.cos(t*Math.PI)))); // Just a little bounce
            country.attr("d", path);
            station.attr("d",path);
            line.attr("d", path);
            land.attr("d", path);
            vors = stations.map(function(s) {
                return projection(s.coordinates)
            })
            vor.data(voronoi.polygons(vors)).attr("d", renderCell);
          };
        })
      .transition()
        .on("end", step);
  }
}

var d3_radians = Math.PI / 180;

function d3_geo_greatArcInterpolator() {
  var x0, y0, cy0, sy0, kx0, ky0,
      x1, y1, cy1, sy1, kx1, ky1,
      d,
      k;

  function interpolate(t) {
    var B = Math.sin(t *= d) * k,
        A = Math.sin(d - t) * k,
        x = A * kx0 + B * kx1,
        y = A * ky0 + B * ky1,
        z = A * sy0 + B * sy1;
    return [
      Math.atan2(y, x) / d3_radians,
      Math.atan2(z, Math.sqrt(x * x + y * y)) / d3_radians
    ];
  }

  interpolate.distance = function() {
    if (d == null) k = 1 / Math.sin(d = Math.acos(Math.max(-1, Math.min(1, sy0 * sy1 + cy0 * cy1 * Math.cos(x1 - x0)))));
    return d;
  };

  interpolate.source = function(_) {
    var cx0 = Math.cos(x0 = _[0] * d3_radians),
        sx0 = Math.sin(x0);
    cy0 = Math.cos(y0 = _[1] * d3_radians);
    sy0 = Math.sin(y0);
    kx0 = cy0 * cx0;
    ky0 = cy0 * sx0;
    d = null;
    return interpolate;
  };

  interpolate.target = function(_) {
    var cx1 = Math.cos(x1 = _[0] * d3_radians),
        sx1 = Math.sin(x1);
    cy1 = Math.cos(y1 = _[1] * d3_radians);
    sy1 = Math.sin(y1);
    kx1 = cy1 * cx1;
    ky1 = cy1 * sx1;
    d = null;
    return interpolate;
  };

  return interpolate;
}
