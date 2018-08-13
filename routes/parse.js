var express = require('express');
var router = express.Router();
var request = require('request')
var multer  = require('multer')
var fs = require('fs')
const sgMail = require('@sendgrid/mail');
var _ = require('lodash');
var ical = require('ical')
var moment = require('moment');
var Model = require('../models');
var schedule = require('node-schedule');

var numberOfSends = 0;

const EmailContent = require('../components/EmailContent.js')

router.get('/ical', function (req, res) {

  var insightType = 'test';
  var recipients = [];
  
  console.log( '----- NEW TEST EVENT FILE PARSE' );

  //var ical_data = ical.parseFile('./uploads/iCal-20180619-172902-1529454543514.ics')
  // console.log(ical_data)

  parseIcal = ical_data[Object.keys(ical_data)[0]]
  if ( parseIcal.type == "VTIMEZONE") {
    console.log("**** FROM ICAL")
    parseIcal = ical_data[Object.keys(ical_data)[1]]
  }

  console.log( 'Organizer Name:', parseIcal.organizer.params.CN, 'Organizer Email:', parseIcal.organizer.val)
  console.log( 'Start:', JSON.stringify(parseIcal.start), 'End:', JSON.stringify(parseIcal.end) )
  console.log( 'Start:', moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
  console.log( 'End:', moment(JSON.stringify(parseIcal.end),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
  console.log( 'Summary:', parseIcal.summary)

  /* =====  replace "to" response with calendar attendees */
      var toArray = [];
      var flatRecipients = [];
    _.forEach(parseIcal.attendee, function(value) {

        if ( typeof value.val !== 'undefined' ) {
        var attendee = value.val.toLowerCase()
        console.log('Attendee:', attendee, "Attendee Email:", attendee.split(':')[1])
        
        var recipient = attendee.split(':')[1];

        if ( recipient.indexOf('meetbrief') < 0 ) {
          toArray.push( { email : recipient } )
          flatRecipients.push(recipient)
        } 
      }

    })
  
  var organizer = ""

  if ( typeof parseIcal.organizer.val !== undefined ) {
    if ( parseIcal.organizer.val.toLowerCase().indexOf('mailto:') >= 0 ) {
      organizer = parseIcal.organizer.val.toLowerCase().split('mailto:')[1]
    } else {
      organizer = parseIcal.organizer.val
    }
  } else {
    organizer = "Someone"
  }

  console.log('Organizer:', organizer)

  if ( flatRecipients.indexOf(organizer) < 0 ) {
      toArray.push( { email : organizer } )
  }

  sender = organizer
  emailDomain = organizer.replace(/.*@/, "").split('.')[0];
  summary = parseIcal.summary
  meeting_time = moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma")
  meeting_date = moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D")

    console.log( '----- END EVENT FILE PARSE' );

  console.log('email domain:', emailDomain)
  console.log('to array:', toArray)


    res.send('test in console')
})


router.get('/send', function (req, res) {

  // ,sarah@loosegrip.net
  var to = 'martymix@gmail.com,sarah@loosegrip.net'
  console.log('page refresh send attempt:', to)

  var email = JSON.parse(JSON.stringify(EmailContent.email_lg));

  email.replacements.summary = "LooseGrip Email";
  email.replacements.meeting_time = moment().format("ddd, MMMM D [at] h:mma")
  email.replacements.meeting_date = moment().format("ddd, MMMM D")
  
   var theEmail = EmailContent.processEmail(email)

   theEmail.then( function(result) {

    var recipients = to.split(',')

    var from = "insights@meetbrief.com"
      
      var subject = ""

      subject = result.data.subject;
      subject += " " + result.data.summary + " "
      subject += " " + "(" + result.data.meeting_date + ")"

      var toArray = [];

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
       
      _.forEach(recipients, function(recipient) {
        toArray.push( { email : recipient } )
      })

     const msg = {
        to: toArray,
        from: {
          email : from,
          name: "MeetBrief"
        },
        subject: subject,
        text: result.emailToSend,
        html: result.emailToSend

      };

     //sgMail.send(msg);

      res.send(result.emailToSend)
 
   })

})

router.post('/send', function (req, res) {

  console.log('user controlled send attempt:', req.body.to)

  var theEmail = EmailContent.processEmail(req.body)

   theEmail.then( function(result) {

      var to = req.body.to
      var recipients = req.body.to.split(',')

      var from = "insights@meetbrief.com"
      var toArray = [];

      var subject = ""
      subject = result.data.subject;
      subject += " " + result.data.summary + " "
      subject += " " + "(" + result.data.meeting_date + ")"
    
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
       
      _.forEach(recipients, function(recipient) {
        toArray.push( { email : recipient } )
      })

     const msg = {
        to: toArray,
        from: {
          email : from,
          name: "MeetBrief"
        },
        subject: subject,
        text: result.emailToSend,
        html: result.emailToSend

      };

      sgMail.send(msg);

      console.log( 'email sent to: ',  to ) 
   })

})

router.get('/parse', function (req, res) {

  console.log('PARSE EMAIL Get noop ===============================')
  res.send('this is just a post endpoint')

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

    console.log('PARSE EMAIL START ===============================')

    numberOfSends++;
    
    if (!req.body) {
      console.log('no body. thats wacky')
      res.sendStatus(200);
    } else {}


   /* ===== data from sendgrid parse ======= */
    
    var from = req.body.from;
    var fromEmail = JSON.parse(req.body.envelope).from;
    var to = req.body.to;
    var message = req.body.text;
    var subject = req.body.subject;
    var num_attachments = req.body.attachments;
    var attachmentInfo = req.body['attachment-info']
    var insightType = "default"

    if ( fromEmail.indexOf('bounce') >= 0 ) {
      console.log('******************')
      console.log('bounce! do not send!!', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      console.log('******************')
      return;
    }

    if ( subject.indexOf('cancelled') >= 0 ) {
      console.log('******************')
      console.log('cancelled subject! do not send!!', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      console.log('******************')
      return;
    }

    if ( subject.indexOf('canceled') >= 0 ) {
      console.log('******************')
      console.log('cancelled subject! do not send!!', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      console.log('******************')
      return;
    }
    
    console.log('from', from)
    console.log('fromEmail', fromEmail)
    console.log('to', to)
    //console.log('message', message)
    console.log('subject', subject)
    console.log('num_attachments', num_attachments)
    //console.log('body', req.body)

   /* =====  get recipients from sendgrid to response */

    var recipients = req.body.to.split(',')
    recipients.push(fromEmail)
    var toArray = [];
 
    _.forEach(recipients, function(recipient) {
        
      if ( recipient.indexOf('meetbrief') < 0 ) {
        toArray.push( { email : recipient } )
      } else {
        insightType = recipient.split('@')[0]
      }

    })

   /* ===== data from sendgrid parse ======= */
 
    /* ===== default values ======= */
  
   var sender = fromEmail
   var emailDomain = fromEmail.replace(/.*@/, "").split('.')[0];
   var summary = "Parsed Email Test"
   var meeting_time = moment().format("ddd, MMMM D [at] h:mma")
   var meeting_date = moment().format("ddd, MMMM D")
   
   /* ======== */


    /* ===== look for .ics file ======= */

   for (i = 1; i <= num_attachments; i++){
    
    var attachment = req.files['attachment' + i];
    //console.log('attachment' + i, attachment)
  
    attachment = attachment[0]

    if ( typeof attachment.originalname !== 'undefined') {

        if ( attachment.originalname.split('.')[1] == 'ics' || attachment.originalname.split('.')[1] == 'txt' ) {

            console.log( '----- NEW EVENT FILE PARSE', attachment.originalname.split('.')[1], attachment.path );

            var ical_data = ical.parseFile(attachment.path)
           // console.log(ical_data)
            parseIcal = ical_data[Object.keys(ical_data)[0]]
            if ( parseIcal.type == "VTIMEZONE") {
              console.log("**** FROM ICAL")
              parseIcal = ical_data[Object.keys(ical_data)[1]]
            }
      
            console.log( 'Organizer Name:', parseIcal.organizer.params.CN, 'Organizer Email:', parseIcal.organizer.val)
            console.log( 'Start:', JSON.stringify(parseIcal.start), 'End:', JSON.stringify(parseIcal.end) )
            console.log( 'Start:', moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
            console.log( 'End:', moment(JSON.stringify(parseIcal.end),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
            console.log( 'Summary:', parseIcal.summary)

            /* =====  replace "to" response with calendar attendees */
             var flatRecipients = [];
            _.forEach(parseIcal.attendee, function(value) {

              if ( typeof value.val !== 'undefined' ) {
               var attendee = value.val.toLowerCase()
               console.log('Attendee:', attendee, "Attendee Email:", attendee.split(':')[1])
               
                var recipient = attendee.split(':')[1];

                if ( recipient.indexOf('meetbrief') < 0 ) {
                  toArray.push( { email : recipient } )
                  flatRecipients.push(recipient);
                  recipients.push(recipient);
                } 
              }

            })
         
          var organizer = ""

          if ( typeof parseIcal.organizer.val !== undefined ) {
            if ( parseIcal.organizer.val.toLowerCase().indexOf('mailto:') >= 0 ) {
              organizer = parseIcal.organizer.val.toLowerCase().split('mailto:')[1]
            } else {
              organizer = parseIcal.organizer.val
            }
          } else {
            organizer = "Someone"
          }

          console.log('Organizer:', organizer)

          if ( flatRecipients.indexOf(organizer) < 0 ) {
              toArray.push( { email : organizer } )
          }

            sender = organizer
            emailDomain = organizer.replace(/.*@/, "").split('.')[0];
            summary = parseIcal.summary
            meeting_time = moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma")
            meeting_date = moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D")

            console.log( '----- END EVENT FILE PARSE' );
            Model.Meeting.create({
              to: recipients,
              meeting_name: parseIcal.organizer.params.CN,
              sender: organizer,
              start_time: moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').toDate(),
              end_time: moment(JSON.stringify(parseIcal.end),'YYYYMMDDTHHmmssZ').toDate(),
              summary: summary
            }).then(function (meeting) {
               /* ===== modify base email ======= */

              console.log('email domain:', emailDomain)
              console.log('insight type', insightType)

              switch ( emailDomain ) {

                case 'loosegrip' :
                  var email = JSON.parse(JSON.stringify(EmailContent.email_lg))
                break

                case 'presidio' :
                  var email = JSON.parse(JSON.stringify(EmailContent.email));
                break

                case 'unilever' :
                  var email = JSON.parse(JSON.stringify(EmailContent.email_unilever))
                break

                default :
                  var email = JSON.parse(JSON.stringify(EmailContent.email));
                break

              }

              email.replacements.sender = sender
              email.replacements.summary = summary
              email.replacements.meeting_time = meeting_time
              email.replacements.meeting_date = meeting_date

              /* ===== make and send email ======= */

              var theEmail = EmailContent.processEmail(email)

              theEmail.then( function(result) {

                  var from = "insights@meetbrief.com"

                  var subject = ""
                  subject = result.data.subject;
                  subject += " " + result.data.summary + " "
                  subject += " " + "(" + result.data.meeting_date + ")"
                  
                  
                
                  const msg = {
                    to: toArray,
                    from: {
                      email : from,
                      name: "MeetBrief"
                    },
                    subject: subject,
                    text: result.emailToSend,
                    html: result.emailToSend

                  };
                  
                  schedule.scheduleJob(date, function(data){
                    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                    sgMail.send(data.msg);
                    data.moment.updateAttributes({
                      is_sent: true
                    }).then(function (result) {
                      console.log('sent: ', result);
                    });
                  }.bind(null,{
                    meg: msg,
                    momnet: moment
                  }));

                  console.log( 'parsed email sent to: ',  toArray )
                  console.log( 'number of sends: ',  numberOfSends )

                  res.sendStatus(200);

              })
            });

        }

    }
  }


  console.log('requested meetbrief', 'from email:', fromEmail)
  
});



module.exports = router




  //https://sendgrid.com/docs/Classroom/Send/When_Emails_Are_Sent/can_i_stop_a_scheduled_send.html
   //  "send_at": 1484913600,
    //"batch_id": "YOUR_BATCH_ID"
