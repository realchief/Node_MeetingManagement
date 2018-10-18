var express = require('express');
var router = express.Router();

const moment = require("moment");

router.get('/chart/:chart', function (req, res) {

  var chartNumbers = req.params.chart;
  var numChartArray = [];
  var chartArray = req.params.chart.split(',');
  for (var i=0,l=chartArray.length;i<l;i++) numChartArray.push(+chartArray[i]);
  //console.log(numChartArray);  

  var formattedDateTime = moment().format('YYYY-MM-DD-hh-mm-s');
  //console.log(formattedDateTime);

  var filePath = './static/assets/chart-images/';
  var fileName = 'chart.png';
  var fullFileName = formattedDateTime.concat('_', fileName)
  var fileFullPath = filePath.concat('/', fullFileName);
  //console.log(fileFullPath);  
  
  var fs = require('fs');
  var JSDOM = require('jsdom').JSDOM;

  var jsdom = new JSDOM('<body><div id="container" style="margin:0;padding:0"></div></body>', {runScripts: 'dangerously'});
  var window = jsdom.window;

  var anychart = require('anychart')(window);
  var anychartExport = require('anychart-nodejs')(anychart);

  var chart = anychart.line();
  chart.bounds(0, 0, 300, 100); 
  chart.padding(0);
  chart.margin(0);
  
  chart.yAxis().enabled(false);
  chart.yAxis().labels(false)

  chart.xAxis().enabled(false);
  //chart.xAxis().labels(false)

  //chart.yScale().minimum(0).maximum(100);
  //chart.yScale().maximum(100);

  chart.background().fill('#32343F');
  chart.legend(false)
  chart.title(false);
  chart.container('container');  

  // create a line series and set the data
  var series = chart.line(numChartArray);
  series.stroke({
    color: "#4db9f6",
    thickness: 3,
    lineCap: 'round'
  })

  chart.draw();


  anychartExport.exportTo(chart, 'png').then(function(image) {

    fs.writeFile(fileFullPath, image, function(fsWriteError) {

      if (fsWriteError) {

        console.log(fsWriteError);

      } else {

         res.render('chart-test', {
            layout: 'main',  
            datetime: formattedDateTime 
          })

      }

    });
  }, function(generationError) {

    console.log(generationError);

  });

 
})

module.exports = router