var express = require('express');
var router = express.Router();

const moment = require("moment");

router.get('/chart/:chart', function (req, res) {

  var chartNumbers = req.params.chart;
  var numChartArray = [];
  var chartArray = req.params.chart.split(',');
  for (var i=0,l=chartArray.length;i<l;i++) numChartArray.push(+chartArray[i]);
  console.log(numChartArray);  

  var formattedDateTime = moment().format('Y-m-d-H-M-S');
  console.log(formattedDateTime);

  var filePath = './static/assets/chart_image/';
  var fileName = 'chart-1.png';
  var fullFileName = formattedDateTime.concat('_', fileName)
  var fileFullPath = filePath.concat('/', fullFileName);
  console.log(fileFullPath);  
  
  var fs = require('fs');
  var JSDOM = require('jsdom').JSDOM;

  var jsdom = new JSDOM('<body><div id="container" style="background-color: #222;"></div></body>', {runScripts: 'dangerously'});
  var window = jsdom.window;

  var anychart = require('anychart')(window);
  var anychartExport = require('anychart-nodejs')(anychart);

  var chart = anychart.line(numChartArray);
  chart.bounds(0, 0, 322, 130); 
  chart.yAxis().enabled(false);
  // chart.stroke("1 blue");
  chart.xAxis().enabled(false);
  chart.background().fill('32343F');
  chart.labels(false).legend(false).title(false);
  chart.container('container');  
  chart.draw();

  anychartExport.exportTo(chart, 'png').then(function(image) {
    fs.writeFile(fileFullPath, image, function(fsWriteError) {
      if (fsWriteError) {
        console.log(fsWriteError);
      } else {
        console.log('Complete');            
      }
    });
  }, function(generationError) {
    console.log(generationError);
  });

  res.render('fingertips', {
    layout: 'chart-test.handlebars',  
    datetime: formattedDateTime 
  })

})

module.exports = router