(function(){

datafile = "https://raw.githubusercontent.com/corona-datenspende/data-updates/master/detections/weekly_detection.json"

var meta, data,plots,dates;

d3.json(datafile, function(data_from_file) {

	console.log(data_from_file)
	meta = data_from_file["meta"]
	data = data_from_file["data"]
	d3.select("#number_of_donors").text(meta.donors)
	d3.select("#number_of_new_donors").text(meta.new_users)
	d3.select("#number_of_donations").text(meta.donations)
	d3.select("#last_updated").text(meta.date_updated)
})

})()
