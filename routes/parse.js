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

  // add awesome pizza meeting
  var getMeetingInfo = emails.meetingFileParse('./uploads/invite-1534959593903.ics') 
  // cancel awesome pizza meeting
  var getMeetingInfo = emails.meetingFileParse('./uploads/invite-1534959697885.ics') 

  getMeetingInfo.then( function(meetingInfo) {

     if ( !meetingInfo ) {
      console.log('!!! meeting info is blank.', '\n', meetingInfo)
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

       var meetingId = meetingInfo.summary + '_' + moment(meetingInfo.meeting_start,'YYYYMMDDTHHmmssZ') + '_' + user_id

       /* CANCEL THE MEETING */
      if ( meetingInfo.request_type == "cancel") {
        
        console.log('\n', emoji.get('mute'), '!-----','this is a cancel request for', meetingInfo.summary, 'from', meetingInfo.emailDomain, 'for', moment(meetingInfo.meeting_start, 'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma"), '\n')
        
        emails.cancel( user_id, meetingInfo.meeting_start, function(meetings) {
             
            console.log(emoji.get('mute'), 'we have cancelled these meetings:', meetings)

            // output manual ical response //
              res.send( {
                'message' : 'ical endpoint: ' + meetingInfo.summary,
                'email domain:' : meetingInfo.emailDomain,
                'to array (sendgrid_recipients):' : meetingInfo.sendgrid_recipients,
                'company id' : meetingInfo.organizer,
                'user id' : user_id,
                'meeting_id' : meetingId,
                'file name' : meetingInfo.file_name,
                'request_type' : meetingInfo.request_type,
                'start date' : moment(meetingInfo.meeting_start).format("dddd, MMMM Do YYYY, h:mma")

              })

              return
      
         })
        
      } 

      /* CREATE THE MEETING */
      if ( meetingInfo.request_type == "request") {

        Model.Meeting.create({

            to: meetingInfo.recipients,
            meeting_name: meetingInfo.summary,
            sender: meetingInfo.organizer,
            UserId : user_id,
            meeting_id : meetingId,
            file_name: meetingInfo.file_name,
            start_time: meetingInfo.meeting_start,
            end_time: meetingInfo.meeting_end, 
            start_date: moment(JSON.stringify(meetingInfo.meeting_start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D"),
            end_date: moment(JSON.stringify(meetingInfo.meeting_end),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D")
          
          }).then(function (meeting) {
             /* ===== modify base email ======= */

             //organizer, summary, toArray, start_date, cb//
            
            //organizer, summary, toArray, start_date, cb//
            emails.make_email_content(meetingInfo.organizer, meetingInfo.summary, meetingInfo.sendgrid_recipients, meetingInfo.meeting_start, function (msg) {
                
                // ---- schedule the email for sending
                
                emails.schedule_email(meetingId, meetingInfo.meeting_start, msg, meeting);

                // output manual ical response //
                res.send( {
                  'message' : 'ical endpoint: ' + meetingInfo.summary,
                  'email domain:' : meetingInfo.emailDomain,
                  'to array (sendgrid_recipients):' : meetingInfo.sendgrid_recipients,
                  'company id' : meetingInfo.organizer,
                  'user id' : user_id,
                  'meeting_id' : meetingId,
                  'file name' : meetingInfo.file_name,
                  'request_type' : meetingInfo.request_type,
                  'start date' : moment(meetingInfo.meeting_start).format("dddd, MMMM Do YYYY, h:mma")
                })
        
            })

          });
    
      }


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

  console.log('\n', emoji.get('eyeglasses'), '=== inbound parse start ===============================', '\n')

  if (!req.body) {
    console.log('no body. thats wacky')
    res.sendStatus(200);
  } 

  /* --- if we have inbound data from SendGrid --- */
  var getMeetingInfo = emails.inboundParse( req )
 
  getMeetingInfo.then( function(meetingInfo) {

    console.log(emoji.get('trumpet'), emoji.get('trumpet'), '------ meeting info from incoming request ----', '\n', meetingInfo)

     if ( !meetingInfo ) {
      console.log('!!! meeting info is blank.', '\n', meetingInfo)
      res.sendStatus(200);
      console.log('\n', '=== inbound parse end ===============================', '\n')
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

       var meetingId = meetingInfo.summary + '_' + moment(meetingInfo.meeting_start,'YYYYMMDDTHHmmssZ') + '_' + user_id

      /* CANCEL THE MEETING */
      if ( meetingInfo.request_type == "cancel") {
        
        console.log('\n', emoji.get('trumpet'), emoji.get('trumpet'),  '!-----','this is a cancel request for', meetingInfo.summary, 'from', meetingInfo.emailDomain, 'for', moment(meetingInfo.meeting_start, 'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma"), '\n')
        
        emails.cancel( user_id, meetingInfo.meeting_start, function(meetings) {
            
            console.log(emoji.get('mute'), 'we have cancelled these meetings:', meetings)
            res.sendStatus(200);
            console.log('\n', '=== inbound parse end ===============================', '\n')
            return

         })
        
      } 

      /* CREATE THE MEETING */
       if ( meetingInfo.request_type == "request") {
      
        Model.Meeting.create({

            to: meetingInfo.recipients,
            meeting_name: meetingInfo.summary,
            sender: meetingInfo.organizer,
            UserId : user_id,
            meeting_id : meetingId,
            file_name: meetingInfo.file_name,
            start_time: meetingInfo.meeting_start,
            end_time: meetingInfo.meeting_end, 
            start_date: moment(JSON.stringify(meetingInfo.meeting_start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D"),
            end_date: moment(JSON.stringify(meetingInfo.meeting_end),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D")
          
          }).then(function (meeting) {
             /* ===== modify base email ======= */

             //organizer, summary, toArray, start_date, cb//
            emails.make_email_content(meetingInfo.organizer, meetingInfo.summary, meetingInfo.sendgrid_recipients, meetingInfo.meeting_start, function (msg) {
                
                // ---- schedule the email for sending
                emails.schedule_email(meetingId, meetingInfo.meeting_start, msg, meeting);

                res.sendStatus(200);
               console.log('\n', '=== inbound parse end ===============================', '\n')
        
            })

          });

      }

    
    })

  })






});



module.exports = router




  //https://sendgrid.com/docs/Classroom/Send/When_Emails_Are_Sent/can_i_stop_a_scheduled_send.html
   //  "send_at": 1484913600,
    //"batch_id": "YOUR_BATCH_ID"
