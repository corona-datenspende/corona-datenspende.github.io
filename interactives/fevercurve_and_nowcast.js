
// Select detection.json (weekly_detection.json) based on queryString
var queryString = window.location.search;

if (queryString.includes("test-automatic-update"))
{
  var url = "https://raw.githubusercontent.com/corona-datenspende/data-updates/automatic-update/detections/weekly_detection.json"
  console.log("this is a test display. I will load the data from the 'automatic-update' branch of the repository");
}
else
{
  var url = "https://raw.githubusercontent.com/corona-datenspende/data-updates/master/detections/weekly_detection.json"
  console.log("Displaying the published detections.json. I will load the data from the 'master' branch of the repository");
}

if (queryString.includes("local-detection")){
  var url = "/science/data/detection.json"
  console.log("This is a test display with a local detection.json file in /static/data/")
}

// Select language
var path = window.location.pathname;
var lang = path.includes("/science/en/") ? "en" : "de"

if (lang == "en") {
  var legendKeys = ["Confirmed Incidence", "Fever-based nowcast", "Fever detections"]
  var legendWidth = 175
  var leftYLabel = "Average incidence (New cases / 100.000 people)"
  var rightYLabel = "Average fever detections / 100.000 people"
  var lastUpdated = "Last updated: "
  var nowcastLegendKey = "Current nowcast"
}

else {
  var legendKeys = ["Bestätigte Inzidenz", "Fieber-basierter Nowcast", "Fieberdetektionen"]
  var legendWidth = 195
  var leftYLabel = "Durchschnittliche Inzidenz (Neue Fälle / 100.000 Einwohner)"
  var rightYLabel = "Durchschnittliche Fieberdetektionen / 100.000 Einwohner"
  var lastUpdated = "Letztes Update: "
  var nowcastLegendKey = "Aktueller Nowcast"

}

// Compute the nowcast according to I(t) = r(t-1) * D(t)
function computeNowcast(r, detections) {
  const nowcast = []

  for (let i=0; i<detections.length-1; i++) {
    nowcast[i] = r[i] * detections[i+1]
  }

  return nowcast;
}

// Some global parameters
var width = 700;
var height = 500;
var margin = {left: 75, top: 20, bottom: 70, right: 70};
var colors = ["#2980b9", "maroon", "#455266"]
var currentNowcastColor = "#f39c12"

// Load data from external source
d3.json(url).then(function(data) {

    // Load the relevant entries
    var caseCounts = data["data"]["all"]["cases_per_100k"].map((d) => d / 7)
    var detections = data["data"]["all"]["detections_per_100k"].map((d) => d / 7)
    var r =  data["data"]["all"]["r"]
    var time = data["meta"]["date_range"]

    // Remove first time point due to quality issues
    caseCounts = caseCounts.filter((d, i) => i > 0)
    detections = detections.filter((d, i) => i > 0)
    r = r.filter((d, i) => i > 0)
    time = time.filter((d, i) => i > 0)

    // Compute the nowcast from r and the detections
    var nowcast = computeNowcast(r, detections)

    // Put SVG on page
    const svg = d3.select("#fever_curve-display")
                  .append("svg")
                  .attr("id", "svg")
                  .attr("width", width)
                  .attr("height", height)

    // Define scales to translate domains of the data to the range of the svg
    var xMin = d3.min(time, (d) => d);
    var xMax = d3.max(time, (d) => d);

    var casesMax = d3.max(caseCounts, (d) => d);
    var nowcastMax = d3.max(nowcast, (d) => d);

    var yMax = d3.max([casesMax, nowcastMax])
    var detectionsMax = d3.max(detections, (d) => d);

    var xScale = d3.scaleTime()
                   .domain([new Date(xMin), new Date(xMax)])
                   .range([margin.left, width-margin.right])

    var yScaleLeft = d3.scaleLinear()
                       .domain([0, yMax * 1.1])
                       .range([height-margin.bottom, margin.top])

    var yScaleRight = d3.scaleLinear()
                        .domain([0, detectionsMax * 1.5])
                        .range([height-margin.bottom, margin.top])

    // Draw and transform/translate horizontal and vertical axes
    var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.timeFormat("%d.%m"))
    var yAxisLeft = d3.axisLeft().scale(yScaleLeft)
    var yAxisRight = d3.axisRight().scale(yScaleRight)

    svg.append("g")
       .attr("transform", "translate(0, "+ (height - margin.bottom + 5) + ")")
       .attr("id", "x-axis")
       .call(xAxis)
       .selectAll("text")
       .attr("transform", "rotate(-35)")
       .style("text-anchor", "end")
       .attr("dy", ".8em")

    svg.append("g")
       .attr("transform", "translate("+ (margin.left - 8)+", 0)")
       .attr("id", "y-axis")
       .call(yAxisLeft)

    svg.append("g")
          .attr("transform", "translate("+ (width - margin.right + 8)+", 0)")
          .attr("id", "y-axis")
          .call(yAxisRight)

    // Draw detection curve
    svg.append("path")
       .datum(detections)
       .attr("d", d3.line()
                    .x((d, i) => xScale(new Date(time[i])))
                    .y((d) => yScaleRight(d)))
       .attr("fill", "none")
       .attr("stroke", colors[2])
       .attr("stroke-width", 2.5)
       .style("stroke-dasharray", ("3, 3"))
       .attr("opacity", 0.6)


    // Draw incidence
    // Remove last data point to show that it might still be unreliable due to reporting errors
    svg.append("path")
       .datum(caseCounts.filter((d, i) => i < caseCounts.length - 1))
       .attr("d", d3.line()
                    .x((d, i) => xScale(new Date(time[i])))
                    .y((d) => yScaleLeft(d)))
       .attr("fill", "none")
       .attr("stroke", colors[0])
       .attr("stroke-width", 2.5)
       .attr("opacity", 0.6)

    // Draw nowcast
    svg.append("path")
       .datum(nowcast)
       .attr("d", d3.line()
                    .x((d, i) => xScale(new Date(time[i+1])))
                    .y((d) => yScaleLeft(d)))
       .attr("fill", "none")
       .attr("stroke", colors[1])
       .attr("stroke-width", 3)
       //.attr("opacity", 0.7)


    // Highligh most recent nowcast with a circle
    svg.selectAll("currentNowcast")
       .data(nowcast.filter((d, i) => i == nowcast.length - 1))
       .enter()
       .append("circle")
       .attr("cx", (d) => xScale(new Date(time[time.length-1])))
       .attr("cy", (d) => yScaleLeft(d))
       .attr("r", 6)
       .attr("fill", currentNowcastColor)
       .attr("data-legend", "Nowcast")

    // Add axes labels
    svg.append("text")
       .attr("y", 20)
       .attr("x", -height/2 + (margin.bottom - margin.top) / 2)
       .attr("transform", "rotate(-90)")
       .attr("text-anchor", "middle")
       .attr("font-size", 14)
       .text(leftYLabel);

    svg.append("text")
       .attr("y", width - 10 )
       .attr("x", -height/2 + (margin.bottom - margin.top) / 2)
       .attr("transform", "rotate(-90)")
       .attr("text-anchor", "middle")
       .attr("font-size", 14)
       //.attr("fill", colors[2])
       .text(rightYLabel);

    // Add legend
    // Create legend object

    // Grey box around legend
    svg.append("rect").attr("x", 85).attr("y", margin.top+5).attr("rx", 5).attr("ry", 5)
                      .attr("width", legendWidth).attr("height", 100)//.attr("opacity", 0.2)
                      .attr("fill",  "#ecf0f1")

    var legend = svg.selectAll(".lineLegend").data(legendKeys).enter()
                    .append("g").attr("class","lineLegend")
                    .attr("transform", (d,i) => "translate(100," + (margin.top+20+i*22)+")");



    // Legend entries for the line plots
    // See this post: https://stackoverflow.com/questions/38954316/adding-legends-to-d3-js-line-charts
    legend.append("text").text((d) => d).attr("transform", "translate(19,5.5)")
          .attr("font-size", 12);

    legend.append("rect").attr("fill", (d, i) => colors[i])
          .attr("width", 14).attr("height", 2.5);

    // Make detections line dashed in legend
    svg.append("rect").attr("x", 101).attr("y", margin.top+20+44)
                      .attr("width", 2).attr("height", 10)
                      .attr("fill",  "#ecf0f1")

    svg.append("rect").attr("x", 106).attr("y", margin.top+20+44)
                      .attr("width", 2).attr("height", 10)
                      .attr("fill",  "#ecf0f1")

    svg.append("rect").attr("x", 111).attr("y", margin.top+20+44)
                      .attr("width", 2).attr("height", 10)
                      .attr("fill",  "#ecf0f1")

    // Legend entry for the current nowcast
    svg.append("circle").attr("cx", 106).attr("cy", margin.top+20 + 3 * 22+1.5).attr("r", 6)
       .attr("fill", currentNowcastColor)//.attr("data-legend", "Nowcast")

    svg.append("text").attr("x", 119).attr("y", margin.top+20+3*22+6)
       .text(nowcastLegendKey).attr("font-size", 12);

    // Add meta-info
    svg.append("text")
       .attr("font-size", 12)
       .attr("font-weight", "bold")
       .attr("text-anchor","end")
       .attr("x", width-margin.right)
       .attr("y", height - 10)
       .text(lastUpdated+data["meta"]["date_updated"])

})
