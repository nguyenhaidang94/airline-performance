

draw_sunburst("http://127.0.0.1:5000/static/sunburst_data.json","Number of delayed flight","sunburst")
function draw_sunburst(link,text,div_id){
  d3.json(link, function(d) {
    return {
          DAY_OF_WEEK:  d.DAY_OF_WEEK,
          OP_UNIQUE_CARRIER: d.OP_UNIQUE_CARRIER,
          count: +d.count,
          Node :d.Node
    };
  }).then(function(rows) {
    const myChart = Sunburst();
    var data1 = rows;
    data1 = _.nest(data1, ["Node","DAY_OF_WEEK","OP_UNIQUE_CARRIER"],function(d){return d[0].count});
    const color = d3.scaleOrdinal(d3.schemePaired);
    myChart.data(data1)
    .size('value')
    .color((d, parent) => color(parent ? parent.data.name : null))
    .showLabels(true)
    .excludeRoot(false)
    .tooltipContent((d, node) => text + ` : <i>${node.value}</i>`)
    (document.getElementById(div_id));
  });

}
