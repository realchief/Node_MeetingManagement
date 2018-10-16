var express = require('express');
var router = express.Router();
var multer  = require('multer')
const sgMail = require('@sendgrid/mail');
var _ = require('lodash');
var ical = require('ical')
var moment = require('moment');
var Model = require('../models');
var schedule = require('node-schedule');
var apis = require('../controllers/apis');
var emails = require('../controllers/emails');

var colors = require('colors');
var emoji = require('node-emoji')

var meeting = require('../controllers/meeting');

var numberOfSends = 0;

const EmailContent = require('../components/EmailContent.js')

router.get('/forceicalparse/:calendarFile', function (req, res) {

  console.log('\n', emoji.get('eyes'), ' ical start ===============================', '\n')

  // add awesome pizza meeting
  var getMeetingInfo = emails.meetingFileParse('./uploads/' + req.params.calendarFile) 

  getMeetingInfo.then( function(meetingInfo) {

    meeting.processMeetingRequest(meetingInfo, function(response) {

        res.send(response);
    
    })

  } )

  
})

router.get('/ical', function (req, res) {

  console.log('\n', emoji.get('eyes'), ' ical start ===============================', '\n')

  // add awesome pizza meeting
  // var getMeetingInfo = emails.meetingFileParse('./uploads/invite_not_recurring.ics') 
  var getMeetingInfo = emails.meetingFileParse('./uploads/monthly-recurring-ends.ics')
  console.log('=========getMeetingInfo===========')
  console.log(getMeetingInfo)

  // getMeetingInfo.then( function(meetingInfo) {

  //   meeting.processMeetingRequest(meetingInfo, function(response) {

  //       res.send(response);
    
  //   })

  // } )

})


router.get('/parse', function (req, res) {

  console.log('inbound parse get noop ===============================')
  res.send('this is just a post endpoint!')

})



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    var splitFile = file.originalname.split('.')
    cb(null, splitFile[0] + '-' + Date.now() + '.' + splitFile[1].toLowerCase());
  }
})
 
var upload = multer({ storage: storage })

var cpUpload = upload.fields([
  { name: 'attachment1', maxCount: 1 }, 
  { name: 'attachment2', maxCount: 1 },
  { name: 'attachment3', maxCount: 1 }
])

router.post('/parse', cpUpload, function (req, res) {

  console.log('\n', emoji.get('eyes'), ' inbound parse start ===============================', '\n')

  if (!req.body) {
    console.log('no body. thats wacky')
    res.sendStatus(200);
  } 

  /* --- if we have inbound data from SendGrid --- */
  var getMeetingInfo = emails.inboundParse( req )
 
  getMeetingInfo.then( function( meetingInfo ) {

    meeting.processMeetingRequest(meetingInfo, function(response){
    
      res.sendStatus(200);
    
    })
  
  } )



});

module.exports = router