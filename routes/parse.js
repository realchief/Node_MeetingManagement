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

var numberOfSends = 0;

const EmailContent = require('../components/EmailContent.js')

router.get('/ical', function (req, res) {

  var getMeetingInfo = emails.meetingFileParse('./uploads/invite-1534483084620.ics') 
  
  getMeetingInfo.then( function(meetingInfo) {

     if ( !meetingInfo ) {
      res.sendStatus(200);
      return
    }

    let whereClause = { 'company_id' : meetingInfo.emailDomain }

    Model.User.findOne({

        where: whereClause

    }).then(function (user) {

       if (!user) {
          var user_id = null
       } else {
          var user_id = user.id
       }

      Model.Meeting.create({

          to: meetingInfo.recipients,
          meeting_name: meetingInfo.summary,
          sender: meetingInfo.organizer,
          UserId : user_id,
          start_time: meetingInfo.meeting_start,
          end_time: meetingInfo.meeting_end, 
          start_date: moment(JSON.stringify(meetingInfo.meeting_start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D"),
          end_date: moment(JSON.stringify(meetingInfo.meeting_end),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D")
        
        }).then(function (meeting) {
           /* ===== modify base email ======= */

           //organizer, summary, toArray, start_date, cb//
          emails.make_email_content(meetingInfo.organizer, meetingInfo.summary, meetingInfo.sendgrid_recipients, meetingInfo.meeting_start, function (msg) {
              
              // ---- schedule the email for sending
              emails.schedule_email(meetingInfo.meeting_start, msg, meeting);

              // output manual ical response //
              res.send( {
                'message' : 'ical endpoint tester',
                'email domain:' : meetingInfo.emailDomain,
                'to array (sendgrid_recipients):' : meetingInfo.sendgrid_recipients,
                'company id' : meetingInfo.organizer,
                'user id' : user_id,
                'start date' : moment(meetingInfo.meeting_start).format("dddd, MMMM Do YYYY, h:mma")

              })
      
          })

        });
    
    })

  })

  
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

  console.log('\n', '=== inbound parse start ===============================', '\n')

  if (!req.body) {
    console.log('no body. thats wacky')
    res.sendStatus(200);
  } 

  /* --- if we have inbound data from SendGrid --- */
  var getMeetingInfo = emails.inboundParse( req )
 
  getMeetingInfo.then( function(meetingInfo) {

    console.log('------ meeting info from incoming request ----', '\n', meetingInfo)

     if ( !meetingInfo ) {
      console.log('!!! meeting info is blank.', '\n', meetingInfo)
      res.sendStatus(200);
      console.log('=== inbound parse end ===============================', '\n')
      return
    }

    let whereClause = { 'company_id' : meetingInfo.emailDomain }


    if ( meetingInfo.request_type == "cancel") {
      console.log('!-----','this is a cancel request for', meetingInfo.summary, 'from', meetingInfo.emailDomain, 'for', moment(meetingInfo.meeting_start, 'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma"))
        res.sendStatus(200);
        console.log('=== inbound parse end ===============================', '\n')
        return
    }
 

    Model.User.findOne({

        where: whereClause

    }).then(function (user) {

       if (!user) {
          var user_id = null
       } else {
          var user_id = user.id
       }

      Model.Meeting.create({

          to: meetingInfo.recipients,
          meeting_name: meetingInfo.summary,
          sender: meetingInfo.organizer,
          UserId : user_id,
          start_time: meetingInfo.meeting_start,
          end_time: meetingInfo.meeting_end, 
          start_date: moment(JSON.stringify(meetingInfo.meeting_start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D"),
          end_date: moment(JSON.stringify(meetingInfo.meeting_end),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D")
        
        }).then(function (meeting) {
           /* ===== modify base email ======= */

           //organizer, summary, toArray, start_date, cb//
          emails.make_email_content(meetingInfo.organizer, meetingInfo.summary, meetingInfo.sendgrid_recipients, meetingInfo.meeting_start, function (msg) {
              
              // ---- schedule the email for sending
              emails.schedule_email(meetingInfo.meeting_start, msg, meeting);

              res.sendStatus(200);
             console.log('=== inbound parse end ===============================', '\n')
      
          })

        });
    
    })

  })

});



module.exports = router




  //https://sendgrid.com/docs/Classroom/Send/When_Emails_Are_Sent/can_i_stop_a_scheduled_send.html
   //  "send_at": 1484913600,
    //"batch_id": "YOUR_BATCH_ID"
