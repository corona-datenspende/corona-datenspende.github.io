// Robert, May 24 2023

// Code consists of 4 parts: 
// 1. Data definition
// 2. Define the SVG element according to language selection
// 3. Introduce the initial scatterplot and connecting lines
// 4. Update function for switching between the two datasets

// 1. Data definition
// Create 2 datasets, data randomly distributed around the model predictions at [1,1.34] and [5,3.95]
var data = [
    {x: 1.00, y: 1.34, type: "main_init_low"},
    {x: 1.21, y: 1.42, type: "colleague_init_low"},
    {x: 1.11, y: 1.59, type: "colleague_init_low"},
    {x: 0.90, y: 1.27, type: "colleague_init_low"},
    {x: 0.80, y: 1.14, type: "colleague_init_low"},
    {x: 0.92, y: 1.18, type: "colleague_init_low"},
    {x: 1.16, y: 1.21, type: "colleague_init_low"},
    {x: 1.11, y: 1.37, type: "colleague_init_low"},
    {x: 0.89, y: 1.39, type: "colleague_init_low"},
    {x: 1.09, y: 1.14, type: "colleague_init_low"},
    {x: 1.01, y: 1.40, type: "colleague_init_low"},
    {x: 0.91, y: 1.50, type: "colleague_init_low"},
    {x: 5.00, y: 3.95, type: "main_init_high"},
    {x: 4.96, y: 3.75, type: "colleague_init_high"},
    {x: 4.97, y: 4.05, type: "colleague_init_high"},
    {x: 4.92, y: 3.86, type: "colleague_init_high"},
    {x: 4.89, y: 3.87, type: "colleague_init_high"},
    {x: 4.99, y: 3.93, type: "colleague_init_high"},
    {x: 4.85, y: 3.84, type: "colleague_init_high"},
    {x: 4.89, y: 4.01, type: "colleague_init_high"},
    {x: 4.91, y: 3.97, type: "colleague_init_high"},
    {x: 4.96, y: 3.96, type: "colleague_init_high"},
    {x: 4.83, y: 3.91, type: "colleague_init_high"},
    {x: 4.98, y: 3.87, type: "colleague_init_high"},
];
    
var newData = [
  {x: 1.00, y: 4.19, type: "main_init_low"},
  {x: 1.21, y: 4.24, type: "colleague_init_low"},
  {x: 1.11, y: 4.27, type: "colleague_init_low"},
  {x: 0.90, y: 4.16, type: "colleague_init_low"},
  {x: 0.80, y: 4.18, type: "colleague_init_low"},
  {x: 0.92, y: 4.31, type: "colleague_init_low"},
  {x: 1.16, y: 4.11, type: "colleague_init_low"},
  {x: 1.11, y: 4.21, type: "colleague_init_low"},
  {x: 0.89, y: 4.07, type: "colleague_init_low"},
  {x: 1.09, y: 4.09, type: "colleague_init_low"},
  {x: 1.01, y: 4.23, type: "colleague_init_low"},
  {x: 0.91, y: 4.20, type: "colleague_init_low"},
  {x: 5.00, y: 4.87, type: "main_init_high"},
  {x: 4.97, y: 4.89, type: "colleague_init_high"},
  {x: 4.99, y: 4.84, type: "colleague_init_high"},
  {x: 4.98, y: 4.77, type: "colleague_init_high"},
  {x: 4.94, y: 4.95, type: "colleague_init_high"},
  {x: 4.98, y: 4.97, type: "colleague_init_high"},
  {x: 4.85, y: 4.92, type: "colleague_init_high"},
  {x: 4.89, y: 4.74, type: "colleague_init_high"},
  {x: 4.91, y: 4.88, type: "colleague_init_high"},
  {x: 4.96, y: 4.90, type: "colleague_init_high"},
  {x: 4.83, y: 4.96, type: "colleague_init_high"},
  {x: 4.98, y: 4.73, type: "colleague_init_high"},
];

// Select language
var path = window.location.pathname;
var lang = path.includes("en/reports") ? "en" : "de"

if (lang == "en") {
  var yLabel = "Compliance at work ▸"
  var xLabel = "Privat compliance ▸"
}
else {
  var yLabel = "Eigene Compliance am Arbeitsplatz ▸"
  var xLabel = "Eigene Compliance im Privatleben ▸"
}
// 2. Define the SVG element
// Define the margin, width and height of the SVG element
var margin = { top: 20, right: 60, bottom: 50, left: 50 };
var width = Math.min(500, window.innerWidth) - margin.left - margin.right;
var height = Math.min(500, window.innerHeight) - margin.top - margin.bottom;

// Define the SVG element to contain the scatterplot and axis labels
var svg = d3.select("#workbehav-display")
  .append("svg")
  .attr("id", "svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// Define the scales for the x and y axes with appropriate domains and ranges
var xScale = d3.scaleLinear()
  .domain([0, 5])
  .range([0, width]);

var yScale = d3.scaleLinear()
  .domain([0,5])
  .range([height, 0]);

// Define color and opacity scales for the different types of points
var colorScale = d3.scaleOrdinal()
  .domain(["main_init_low", "colleague_init_low", "main_init_high", "colleague_init_high"])
  .range(["#1f77b4", "#ffbb78", "#ff7f0e", "#aec7e8"]);

var opacityScale = d3.scaleOrdinal()
  .domain(["main_init_low", "colleague_init_low", "main_init_high", "colleague_init_high"])
  .range([1, 0.5, 1, 0.5]);

// Create the group element to contain the scatterplot and axis labels
var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define the x-axis
var xAxis = d3.axisBottom(xScale)
  .ticks(5);

// Define the y-axis
var yAxis = d3.axisLeft(yScale)
  .ticks(5);

// Append the x-axis to the SVG element
svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
  .call(xAxis);

// Append the y-axis to the SVG element
svg.append("g")
  .attr("class", "y-axis")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .call(yAxis);

// Add the x and y axis labels
g.append("text")
  .attr("class", "x-axis-label")
  .attr("x", width / 2)
  .attr("y", height + margin.bottom / 1.4)
  .attr("text-anchor", "middle")
  .text(xLabel);

g.append("text")
  .attr("class", "y-axis-label")
  .attr("x", -height / 2)
  .attr("y", -margin.left / 2)
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text(yLabel);

// 3. Introduce the initial scatterplot and connecting lines
// Create the initial scatterplot with the data
var circlesMain = g.selectAll("circle.main")
  .data(data.filter(function(d) {
    return d.type === "main_init_low" || d.type === "main_init_high";
  }))
  .enter()
  .append("circle")
  .attr("class", "main")
  .attr("cx", function(d) { return xScale(d.x); })
  .attr("cy", function(d) { return yScale(d.y); })
  .attr("r", 10)
  .attr("fill", "#ffbb78")
  .attr("opacity", function(d) { return opacityScale(d.type); });

var circlesColleagues = g.selectAll("circle.colleague")
  .data(data.filter(function(d) {
    return d.type === "colleague_init_low" || d.type === "colleague_init_high";
  }))
  .enter()
  .append("circle")
  .attr("class", "colleague")
  .attr("cx", function(d) { return xScale(d.x); })
  .attr("cy", function(d) { return yScale(d.y); })
  .attr("r", 10)
  .attr("fill", "#ffbb78")
  .attr("opacity", function(d) { return opacityScale(d.type); });

// Bring main nodes to front
  circlesMain.raise();

  // Add connecting line
var line = d3.line()
  .x(function(d) { return xScale(d.x); })
  .y(function(d) { return yScale(d.y); })
  .curve(d3.curveCardinal);

var fadeCurveLow = g.append("path")
  .attr("class", "fade-curve")
  .attr("fill", "none")
  .attr("stroke-dasharray", ("4,4"))
  .attr("stroke", "#dddddd")
  .style("opacity", 0);

  var fadeCurveHigh = g.append("path")
  .attr("class", "fade-curve-high")
  .attr("fill", "none")
  .attr("stroke-dasharray", ("4,4"))
  .attr("stroke", "#dddddd")
  .style("opacity", 0);


// 4. Update function for switching between the two datasets
//// UPDATE FUNCTION ////
// transition() to smoothly animate the transition between the old and new scatterplots
////----------------////
function update(dataset) {
  // Duplicate positions for shadow effect
  var duplicateCirclesMain = circlesMain.data();
  var duplicateCirclesColleagues = circlesColleagues.data();

  // Append new circles for the original positions
  var initPosCirclesMain = g.selectAll(".init-main")
    .data(duplicateCirclesMain)
    .enter()
    .append("circle")
    .attr("class", "init-main")
    .attr("cx", function(d) { return xScale(d.x); })
    .attr("cy", function(d) { return yScale(d.y); })
    .attr("r", 10)
    .attr("fill", "#ffbb78")
    .attr("opacity", 0.3);

  // Update circlesMain with new dataset
  circlesMain.data(dataset.filter(function(d) {
      return d.type === "main_init_low" || d.type === "main_init_high";
    }))
    .transition()
    .duration(1000)
    .attr("cx", function(d) { return xScale(d.x); })
    .attr("cy", function(d) { return yScale(d.y); })
    .attr("fill", function(d) {
      return dataset === data ? "#ffbb78" : "#aec7e8";
    });

  // Update circlesColleagues with new dataset
  circlesColleagues.data(dataset.filter(function(d) {
      return d.type === "colleague_init_low" || d.type === "colleague_init_high";
    }))
    .transition()
    .duration(1000)
    .attr("cx", function(d) { return xScale(d.x); })
    .attr("cy", function(d) { return yScale(d.y); })
    .attr("fill", function(d) {
      return dataset === data ? "#ffbb78" : "#aec7e8";
    });


  // Bring highlighted nodes to front
  circlesMain.raise();

  //// fade-in delta lines ////
  // a) Update the init-low fade-in curve with new dataset
  var fadeCurve_data_initlow = [data.find(function (d) { return d.type === "main_init_low"; })];
  if (dataset === newData) {
    fadeCurve_data_initlow.push(newData.find(function (d) { return d.type === "main_init_low"; }));
  }
  
  fadeCurveLow.datum(fadeCurve_data_initlow)
    .transition()
    .duration(1000)
    .attr("d", line)
    .style("opacity", dataset === newData ? 1 : 0);

// b) Update the init-high fade-in curve with new dataset
  var fadeCurve_data_inithigh = [data.find(function (d) { return d.type === "main_init_high"; })];
  if (dataset === newData) {
    fadeCurve_data_inithigh.push(newData.find(function (d) { return d.type === "main_init_high"; }));
  }
    
  fadeCurveHigh.datum(fadeCurve_data_inithigh)
    .transition()
    .duration(1000)
    .attr("d", line)
    .style("opacity", dataset === newData ? 1 : 0);
    
}
