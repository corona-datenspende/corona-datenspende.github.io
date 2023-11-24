//new version of Olivia from June 7th

//(function(){

//var detectionColor = "#39a9dc" // light blue
var detectionColor = "maroon"
//var casesColor = "#666"
var casesColor = "#39a9dc"
var casesLabel = {
  en: "New covid-19 cases",
  de: "Neue Covid-19-Fälle"
}

var path = window.location.pathname;
var lang = path.includes("science/en") ? "en" : "de"

var labelpadding = 2;

var plot_margin = {top: 0, right: 70, bottom: 0, left: 70};
var legend_margin = {top: 50, right: 50, bottom: 20, left: 30};

var total_width = 700;
var total_height = 420;
var n_grid_x = 10;
var n_grid_y = 10;
plot_width = 700;
plot_height = 380;

width  = plot_width  - plot_margin.left - plot_margin.right,
height = plot_height - plot_margin.top  - plot_margin.bottom;

legend_width = 700;
legend_height = 120;

leg_width = legend_width - legend_margin.left - legend_margin.right,
leg_height = legend_height - legend_margin.top - legend_margin.bottom;

var display = d3.selectAll("#fever_curve-display").append("svg")
.attr("max-width",total_width)
.attr("viewBox", "0 0 "+total_width+" "+total_height)
.attr("class","explorable_display")
.style("overflow","visible")
.style("margin-top",20)
// .style("border","1px solid black")

var g = widget.grid(total_width,total_height,n_grid_x,n_grid_y);

/*display.selectAll(".grid").data(g.lattice()).enter().append("circle")
.attr("class","grid")
.attr("transform",function(d){
return "translate("+d.x+","+d.y+")"
})
.attr("r",1)
.style("fill","black")
.style("stroke","none")	*/

var plot = display.append("g")
.attr("transform","translate(" + plot_margin.left + "," + (plot_height-plot_margin.bottom) + ")");

var legend = display.append("g")
.attr("transform","translate(" + legend_margin.left + "," + (plot_height+legend_height-legend_margin.bottom) + ")");

var X = d3.scaleTime().range([0,width])
var Y = d3.scaleLinear().range([0,-height])
var Y_cases = d3.scaleLinear().range([0,-height]) // Y axis scaling for case count

var X_legend = d3.scaleLinear()
.domain([0,3])
.range([legend_margin.left,leg_width-legend_margin.left-legend_margin.right])
var Y_legend = d3.scaleLinear().domain([0,3]).range([0,-leg_height])

var a = d3.schemeCategory20

var b = a.map(function(x){return LightenDarkenColor(x, -50);})
b[0]="black"
b[4]=b[4]+"00"
var C = d3.scaleOrdinal(b)

var xaxis = d3.axisBottom(X).tickFormat(d3.timeFormat("%d.%m"))
var yaxis = d3.axisLeft(Y)
var yaxis_cases = d3.axisRight(Y_cases)

var area = d3.area()
.x(function(d) { return X(new Date(d.t)); })
.y0(function(d) { return Y(d.y0); })
.y1(function(d) { return Y(d.y1); })

var line = d3.line()//.curve(d3.curveCardinal.tension(0.1))
.x(function(d) { return X(d.x); })
.y(function(d) { return Y(d.y); });

var line_cases = d3.line()//.curve(d3.curveCardinal.tension(0.1))
.x(function(d) { return X(d.x); })
.y(function(d) { return Y_cases(d.y); });

var today = new Date();

var datafile;

let queryString = window.location.search;

if (queryString.includes("test-automatic-update"))
{
  datafile = "https://raw.githubusercontent.com/corona-datenspende/data-updates/automatic-update/detections/detection.json?3rwe";
  console.log("this is a test display. I've loaded the data from the 'automatic-update' branch of the repository");
}
else
{
  datafile = "https://raw.githubusercontent.com/corona-datenspende/data-updates/master/detections/detection.json";
  console.log("Displaying the published detections.json. I've loaded  the data from the 'master' branch of the repository");
}

if (queryString.includes("local-detection")){
  console.log("this is a test display with a local detection.json file in /static/data/")
  datafile = "/data/detection.json"
}

var meta, data,plots,dates;

d3.json(datafile, function(data_from_file) {

  meta = data_from_file["meta"]
  data = data_from_file["data"]

  var labels = lang == "de" ? meta.labels.de : meta.labels.en

  plots = Object.keys(data);
//  console.log('data', data_from_file, plots)
  states = plots.map(function(d){return d});
  states.shift();

  C.domain(plots);
  dates=meta.date_range.map(function(d){return new Date(d.replace(/-/g, "/"))})
  X.domain(d3.extent(dates))



  var ymg = d3.max(data["all"].detections) / d3.mean(data["all"].num_users)
  var ymg_cases = d3.max(data["all"].case_counts)

  Y.domain([0,ymg*1.5])
  Y_cases.domain([0, ymg_cases*1.1])

  var daywidth = X(today)-X(today.setDate(today.getDate()+1))

  plot.append("g")
  .attr("class", "x-axis")
  //.attr("transform", "translate(0," + 200 + ")")
  .call(xaxis)
  .selectAll("text")
  .style("font-size",'10px')
  .style("fill","black")
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "rotate(-35)");

  plot.append("g")
  .attr("class", "y-axis")
  .call(yaxis)
  .selectAll("text")
  .style("fill", detectionColor)

  plot.append("g")
  .attr("class", "y-axis-cases")
  .attr("transform", `translate(${width},0)`)
  .call(yaxis_cases)
  .selectAll("text")
  .style("fill", casesColor)

  var sundays=dates.filter(function(d){return d.getDay()==0})
  var saturdays=dates.filter(function(d){return d.getDay()==6})

  plot.selectAll(".sunday").data(sundays).enter().append("rect")
  .attr("class","sunday")
  .attr("x",function(d){return X(d)+daywidth/2})
  .attr("y",-height)
  .attr("width",-daywidth)
  .attr("height",height)
  .style("fill","rgb(230,230,230)")

  plot.selectAll(".saturday").data(saturdays).enter().append("rect")
  .attr("class","saturday")
  .attr("x",function(d){return X(d)+daywidth/2})
  .attr("y",-height)
  .attr("width",-daywidth)
  .attr("height",height)
  .style("fill","rgb(240,240,240)")

  var pl = plot.selectAll(".curve").data(plots).enter()
  .append("g")
  .attr("class","curve")
  .attr("id",function(d){return d })


  plots.forEach(function(x){
    var N = data[x].num_users;
    data[x].curve1 = data[x].detections.map(function(d,i){
      return {x:dates[i],y:d / data[x].num_users[i]}})
    data[x].curve2 = data[x].trend.map(function(d,i){return {x:dates[i],y:d / data[x].num_users[i] }})

    // covid cases
    data[x].curve3 = data[x].case_counts.map((d, i) => ({ x: dates[i],  y: d })).filter((obj) => obj.y !== null)
  })



    pl.append("path")
    .attr("class","cases")
    .datum(function(d){return data[d].curve3}).attr("d",line_cases)
    .style("stroke",casesColor)
    .style("fill","none")
    .style("stroke-width",1)

    pl.append("path")
    .attr("class","detection")
    .datum(function(d){return data[d].curve1}).attr("d",line)
    // .style("stroke",function(d){return C(d3.select(this.parentNode).datum())})
    .style("stroke", detectionColor)
    .style("fill","none")
    .style("stroke-width",1)
    .style("stroke-dasharray", ("3, 3"))

    pl.selectAll(".dot").data(function(d){return data[d].curve1}).enter().append("circle")
    .attr("class","dot").attr("r",2)
    //	  .style("fill",function(d){return C(d3.select(this.parentNode).datum())})
    .style("fill", detectionColor)
    .attr("transform",function(d){return "translate("+X(d.x)+","+Y(d.y)+")"})

    pl.append("path")
    .attr("class","trend")
    .datum(function(d){return data[d].curve2}).attr("d",line)
    //	 .style("stroke",function(d){return C(d3.select(this.parentNode).datum())})
    .style("stroke", detectionColor)
    .style("fill","none")
    .style("stroke-width",3)


    pl.style("opacity",function(d){return d=="all" ? 1 : 0.1})


    var button = legend.selectAll(".button").data(states).enter().append("g")
    .attr("class","button")
    .attr("transform",function(d,i){
      let n = i % 4;
      let m = Math.floor( i / 4 )
      return "translate("+X_legend(m)+","+Y_legend(n)+")"
    })

    button.append("text")
    .text(d=>d)
    .attr("class","buttontext")
    .style("font-size",10)
    .style("font-weight","bold")
    .style("fill",function(d){return C(d)})
    .style("pointer-events","none");

    button.insert("rect",".buttontext")
    .attr("class","buttonbackground")
    //.style("stroke","black")
    //.style("stroke-width",0.5)
    .style("fill","white")


    button.each(function() {
      var t = d3.select(this).select("text");
      var r = d3.select(this).select("rect");
      var b = t.node().getBBox();
      r.attr("x", b.x - labelpadding)
      .attr("y", b.y - labelpadding)
      .attr("width", b.width + 2 * labelpadding)
      .attr("height", b.height + 2 * labelpadding)
      .attr("rx", 3)
      .attr("ry", 3)
    })

    d3.selectAll(".buttonbackground")
    .on("mouseover",function(d,i){


      var ymg = d3.max(data[d].detections) / d3.mean(data[d].num_users)

      Y.domain([0,ymg*1.5])

      d3.selectAll(".y-axis")
      .call(yaxis)

      pl.select(".detection").datum(function(d){return data[d].curve1})
      .transition()
      .attr("d",line)

      pl.selectAll(".dot")
      .transition()
      .attr("transform",function(d){return "translate("+X(d.x)+","+Y(d.y)+")"})

      pl.select(".trend").datum(function(d){return data[d].curve2})
      .transition()
      .attr("d",line)


      pl.style("opacity",function(x){return x=="all" || x==d ? 1 : 0.1})
      d3.select(this).style("fill","rgb(220,220,220)")
    })
    .on("mouseout",function(d,i){

      var ymg = d3.max(data["all"].detections) / d3.mean(data["all"].num_users)

      Y.domain([0,ymg*1.5])

      d3.selectAll(".y-axis")
      .call(yaxis)

      pl.select(".detection").datum(function(d){return data[d].curve1})
      .transition()
      .attr("d",line)

      pl.selectAll(".dot")
      .transition()
      .attr("transform",function(d){return "translate("+X(d.x)+","+Y(d.y)+")"})

      pl.select(".trend").datum(function(d){return data[d].curve2})
      .transition()
      .attr("d",line)

      pl.style("opacity",function(d){return d=="all" ? 1 : 0.1})
      d3.select(this).style("fill","white")
    })

    pl.append("text").text((lang=="de" ? "Letztes Update: " : "Last updated: ") +meta.date_updated)
    .style("font-size",'12px')
    .style("font-weight","bold")
    .style("text-anchor","end")
    .attr("transform","translate("+(plot_width-plot_margin.left-plot_margin.right)+","+50+")")

    pl.append("text").text(labels.yaxis_rate)
    .attr("transform","rotate(-90)translate("+(plot_height-plot_margin.top-plot_margin.bottom)/2+",-60)")
    .style("text-anchor","middle")
    .style("font-weight","bold")
    .style("font-size",'12px')
    .style("fill", detectionColor)

    pl.append("text").text(casesLabel[lang])
    .attr("transform",`rotate(90)translate(${-(plot_height-plot_margin.top-plot_margin.bottom)/2}, ${-(width+50)})`)
    .style("text-anchor","middle")
    .style("font-weight","bold")
    .style("font-size",'12px')
    .style("fill", casesColor)

    /*pl.append("text").text(labels.title)
    .attr("transform","translate("+(plot_width-plot_margin.left-plot_margin.right)/2+","+(-plot_height+plot_margin.top+plot_margin.bottom+20)+")")
    .style("text-anchor","middle")
    .style("font-size",14)*/

    // add last updated
    // add legend: trendline, daily agggregate
    // englisch German
    // add axis labeling


  },"jsonp")

  function LightenDarkenColor(colorCode, amount) {
    var usePound = false;

    if (colorCode[0] == "#") {
      colorCode = colorCode.slice(1);
      usePound = true;
    }

    var num = parseInt(colorCode, 16);

    var r = (num >> 16) + amount;

    if (r > 255) {
      r = 255;
    } else if (r < 0) {
      r = 0;
    }

    var b = ((num >> 8) & 0x00FF) + amount;

    if (b > 255) {
      b = 255;
    } else if (b < 0) {
      b = 0;
    }

    var g = (num & 0x0000FF) + amount;

    if (g > 255) {
      g = 255;
    } else if (g < 0) {
      g = 0;
    }

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  }

  //
  // Example
  // -------------------------------------------------------

  // Lighten
  var NewColor = LightenDarkenColor("#F06D06", 20);

  // Darken
  var NewColor = LightenDarkenColor("#F06D06", -20);

  //})()