'use strict';
const sgMail = require('@sendgrid/mail');
const schedule = require('node-schedule');
const moment = require("moment");
var ical = require('ical')
var _ = require('lodash');

var Model = require('../models');
var Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

exports.meetingFileParse = ( meetingFile ) => {

    return new Promise(function(resolve, reject) {

        console.log( "\n", '+++++++++++ Parse ICS file', meetingFile, 'on', moment(), "\n" );

        var ical_data = ical.parseFile(meetingFile)  
        var parseIcal = ical_data[Object.keys(ical_data)[0]]
        var insightType = "default"
        var requestType = "request"
        var status = "none"

        if ( parseIcal.type == "VTIMEZONE") {
            // can be VEVENT or VTIMEZONE
            console.log("**** FROM ICAL Object")
            parseIcal = ical_data[Object.keys(ical_data)[1]]
        }

        if ( parseIcal.status ) {
          status = parseIcal.status.toLowerCase();
        }

        //console.log( 'ics data:', parseIcal )

        console.log( 'Organizer Name:', parseIcal.organizer.params.CN, 'Organizer Email:', parseIcal.organizer.val)
        console.log( 'Summary:', parseIcal.summary)
        
        console.log( 'DT Stamp Date:',  moment(JSON.stringify(parseIcal.dtstamp),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
        console.log( 'Created Date:',  moment(JSON.stringify(parseIcal.created),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
        console.log( 'Last Modified:',  moment(JSON.stringify(parseIcal['last-modified']),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
        console.log( 'Sequence:',  parseIcal.sequence )
        console.log( 'Start:', moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
       
        console.log( 'Status:', parseIcal.status)

        /* =====  get calendar attendees */

        // toArray is the array to pass to the sendgrid Send endpoint //
        var toArray = [];
        // flatRecipients is just a flat list of recipients //
        var flatRecipients = [];

        _.forEach(parseIcal.attendee, function(value) {

            if ( typeof value.val !== 'undefined' ) {

                var attendee = value.val.toLowerCase()
                var recipient = attendee.split(':')[1];

                console.log('Attendee:', attendee, "Attendee Email:", attendee.split(':')[1])
            
                // add only attendees who are not "meetbrief" emails //
                if ( recipient.indexOf('meetbrief') < 0 ) {
                  toArray.push( { email : recipient } )
                  flatRecipients.push(recipient)
                } else {
                    insightType = recipient.split('@')[0]
                }
            }

        })


        /* =====  get organizer email */

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

        /* ===== add the organizer to the sendgrid recipient list if not in there */

        if ( flatRecipients.indexOf(organizer) < 0 ) {
          toArray.push( { email : organizer } )
        }


        var emailDomain = organizer.replace(/.*@/, "").split('.')[0];
        var summary = parseIcal.summary
        var sequence = parseIcal.sequence
        var meeting_time_for_display = moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma")
        var meeting_date_for_display = moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D")

        if ( status == "cancelled" || status == "canceled" || status == "cancel" ) {
          requestType = "cancel";
        }

        // get just the file name
        meetingFile = meetingFile.split('uploads/')[1];

        //console.log('Organizer:', organizer, "Company Id", emailDomain)
        console.log("\n", '+++++++++++ done parsing ics file', "\n" );

        return resolve ( {
            'recipients' : flatRecipients,
            'sendgrid_recipients' : toArray,
            'organizer' : organizer,
            'emailDomain' : emailDomain,
            'summary' : summary,
            'meeting_time_for_display' : meeting_time_for_display,
            'meeting_date_for_display' : meeting_date_for_display,
            'meeting_start' : moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').toDate(),
            'meeting_end' : moment(JSON.stringify(parseIcal.end),'YYYYMMDDTHHmmssZ').toDate(),
            'meeting_created' : moment(JSON.stringify(parseIcal.created),'YYYYMMDDTHHmmssZ').toDate(),
            'meeting_dtstamp' : moment(JSON.stringify(parseIcal.dtstamp),'YYYYMMDDTHHmmssZ').toDate(),
            'meeting_sequence' : sequence,
            'insight_type' : insightType,
            'request_type' : requestType,
            'status' : status,
            'file_name' : meetingFile
        } )

    })


}

exports.inboundParse = ( req ) => {

   // console.log('PARSE EMAIL START ===============================')

   /* ===== this is the data that comes in from sendgrid parse ======= */
   
   var thisModule = this 
   return new Promise(function(resolve, reject) {

    var from = req.body.from;
    var fromEmail = JSON.parse(req.body.envelope).from;
    var to = req.body.to;
    var message = req.body.text;
    var subject = req.body.subject;
    var num_attachments = req.body.attachments;
    var attachmentInfo = req.body['attachment-info']
    var insightType = "default"
    var requestType = "request"

    //console.log('\n', emoji.get('email'), 'The whole email:', req.body)


     if ( fromEmail.toLowerCase().indexOf('bounce') >= 0 ) {
      console.log('!!!!!!!!!!!!! ', 'bounce in from email', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      requestType = "bounce"
      //resolve( { type : 'cancel'} );
      //return resolve();
    }

    if ( subject.toLowerCase().indexOf('cancelled') >= 0 ) {
      console.log('!!!!!!!!!!!!! ','cancelled in subject', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      requestType = "cancel"
      //resolve( { type : 'cancel'} );
      //return resolve();
    }

    if ( subject.toLowerCase().indexOf('canceled') >= 0 ) {
      console.log('!!!!!!!!!!!!! ', 'cancelled in subject', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      requestType = "cancel"
      //resolve( { type : 'cancel'} );
      //return resolve();
    }
    
     /* ===== default values ======= */
  
    var organizer = fromEmail
   var emailDomain = fromEmail.replace(/.*@/, "").split('.')[0];
   var summary = "Parsed Direct" + " " + subject
   var meeting_time_for_display = moment().format("ddd, MMMM D [at] h:mma")
   var meeting_date_for_display = moment().format("ddd, MMMM D")

    //console.log('from', from)
    //console.log('fromEmail', fromEmail)
    //console.log('to', to)
    //console.log('message', message)
    //console.log('subject', subject)
    //console.log('num_attachments', num_attachments)
    //console.log('body', req.body)

     /* =====  get recipients from sendgrid to response */
     var flatRecipients = req.body.to.split(',')
     flatRecipients.push(fromEmail)
     var toArray = [];

     _.forEach(flatRecipients, function(recipient) {
        if ( recipient.indexOf('meetbrief') < 0 ) {
          toArray.push( { email : recipient } )
        } else {
          insightType = recipient.split('@')[0]
        }
     })

   /* ===== data from sendgrid parse ======= */

    /* ===== /this is the data that comes in from sendgrid parse ======= */
    var attachmentsList = [];
    for (var i = 1; i <= num_attachments; i++) {
    
       var attachment = req.files['attachment' + i];
       attachment = attachment[0]

        if ( typeof attachment.originalname !== 'undefined') {

            if ( attachment.originalname.split('.')[1] == 'ics' || attachment.originalname.split('.')[1] == 'txt' ) {
                attachmentsList.push(attachment.path)
            }

        }

    }

     /* ===== check to see if we have ics data ======= */

    if ( attachmentsList.length > 0 ) {

        // Resolve with the ICS information
        var icsInfo = thisModule.meetingFileParse(attachmentsList[attachmentsList.length-1]) 
        icsInfo.then( function(meetingInfo) {
            return resolve ( meetingInfo )
        } )

    } else {

        // Resolve with the regular email information

        return resolve ( {
            'attachmentsList' : attachmentsList,
            'recipients' : flatRecipients,
            'sendgrid_recipients' : toArray,
            'organizer' : organizer,
            'emailDomain' : emailDomain,
            'summary' : summary,
            'meeting_time_for_display' : meeting_time_for_display,
            'meeting_date_for_display' : meeting_date_for_display,
            'meeting_start' : moment().toDate(),
            'meeting_end' : moment().toDate(),
            'meeting_created' : moment().toDate(),
            'meeting_dtstamp' : moment().toDate(),
            'meeting_sequence' : 0,
            'insight_type' : insightType,
            'request_type' : 'request',
            'status' : 'add'
        } )

    }

    })

}

exports.schedule_email = (meetingId, meetingDate, msg, meeting, from) => {

    // set time 30 minutes before meeting time
    let current_date = moment().toDate();  
    let date = moment(meetingDate,'YYYYMMDDTHHmmssZ').subtract(30, 'minutes').toDate();   
    let current_assert_date = moment().subtract(30, 'minutes').toDate();  
    var from = from || ""

    if ( from == "reschedule") {
      //console.log('++++ rescheduling ---', meeting.meeting_name, '--- to send at ---', moment(date).format("ddd, MMMM D [at] h:mma"));
    }
     // if scheduled date is after the (current time - 30 mimutes)
    let isAfter = moment(date).isAfter(current_assert_date);

     // if the current time is after the scheduled date
    let scheduledIsAfter = moment(current_date).isAfter(date);
    
    //console.log('==== current date:', moment(current_date).format("ddd, MMMM D [at] h:mma"), '--meeting date--', moment(meetingDate).format("ddd, MMMM D [at] h:mma"), '--schedule date--', moment(date).format("ddd, MMMM D [at] h:mma"), '--assert_date--', moment(current_assert_date).format("ddd, MMMM D [at] h:mma"))

     if ( isAfter == false || scheduledIsAfter == true ) {
      isAfter = false
      date = moment().add(1, 'minutes').toDate();
    }

    if ( schedule.scheduledJobs[meetingId] ) {
      console.log( '\n', emoji.get('warning'), ' ', meetingId, ' meeting is already scheduled - un-schedule the existing one' )
      schedule.scheduledJobs[meetingId].cancel()
    }

     console.log('\n', emoji.get('date'), ' schedule email ---', meeting.meeting_name, 'for', moment(meeting.start_time).format("ddd, MMMM D [at] h:mma").underline, 'to send at'.inverse, moment(date).format("ddd, MMMM D [at] h:mma").underline, '--- send later? ---', isAfter, '\n', ' --- meeting id ', meetingId)


    schedule.scheduleJob(meetingId, date, function(data) {

        console.log('\n', emoji.get('rocket'), ' send scheduled email ---', data.meeting.meeting_name, '----', 'for', '---', moment(data.meeting.start_time).format("ddd, MMMM D [at] h:mma"), '----', 'sent at', '-----', moment().format("ddd, MMMM D [at] h:mma"))

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        //sgMail.send(data.msg);           

        data.meeting.updateAttributes({
          is_sent: true
        }).then(function (result) {
          //console.log(emoji.get('thumbsup'), '---- marked as sent: ', result.meeting_name);
        });

      }.bind(null,{

        msg: msg,
        meeting: meeting

      }));
}


exports.cancel = (user_id, created_time, onFinish) => {

    var thisModule = this 
    let whereClause = { 'UserId' : user_id, 'created_time' : created_time }
    let cancelledMeetings = [];

    Model.Meeting.findAll({

        where: whereClause

    }).then(function(meetings, done) {

       if (!meetings) {
          console.log('no meetings to cancel!!')
       } else {
       }

      Async.each(meetings, function (meeting, done) {

          var meetingId = meeting.meeting_name + '_' + moment(meeting.created_time,'YYYYMMDDTHHmmssZ') + '_' + user_id
          console.log( emoji.get('scissors'), 'remove', meeting.meeting_name, 'which was at:', moment(meeting.start_time).format("ddd, MMMM D [at] h:mma"), 'for meeting_id', meetingId)
          meeting.destroy()
          cancelledMeetings.push(meetingId)
          done();

      }, function (err, result) {
         
         if ( cancelledMeetings.length) {
            
            _.forEach( schedule.scheduledJobs, function( value, key ) {
              console.log('before:', key)
           })

            // now, we need to remove any scheduled jobs, so that the newly deleted ones dont send
            var scheduledJob = schedule.scheduledJobs[cancelledMeetings[0]]
            
            if ( scheduledJob ) {
              console.log(emoji.get('hammer_and_pick'), 'Remove scheduled job for meeting ID:', cancelledMeetings[0])
              scheduledJob.cancel();
            }
          }

          _.forEach( schedule.scheduledJobs, function( value, key ) {
              console.log('after:', key)
           })
          
          onFinish(cancelledMeetings)


      });


   })

}


exports.create = ( user_id, meetingId, meetingInfo, onFinish ) => {

  var thisModule = this;

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
      end_date: moment(JSON.stringify(meetingInfo.meeting_end),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D"),
      dtstamp_time : meetingInfo.meeting_dtstamp,
      created_time : meetingInfo.meeting_created,
      sequence : meetingInfo.meeting_sequence
    
    }).then(function (meeting) {
       /* ===== modify base email ======= */

       //organizer, summary, toArray, start_date, cb//
      thisModule.make_email_content(meetingInfo.organizer, meetingInfo.summary, meetingInfo.sendgrid_recipients, meetingInfo.meeting_start, function (msg) {
          
          // ---- schedule the email for sending
          thisModule.schedule_email(meetingId, meetingInfo.meeting_start, msg, meeting);

          onFinish(meetingId)
          

      })

    });

}

exports.make_email_content = (organizer, summary, toArray, start_date, cb) => {
    
    const EmailContent = require('../components/EmailContent.js');
    let sender = organizer
    let emailDomain = organizer.replace(/.*@/, "").split('.')[0];
    let meeting_time_for_display = moment(start_date).format("ddd, MMMM D [at] h:mma")
    let meeting_date_for_display = moment(start_date).format("ddd, MMMM D")

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
      email.replacements.meeting_time_for_display = meeting_time_for_display
      email.replacements.meeting_date_for_display = meeting_date_for_display

      var theEmail = EmailContent.processEmail(email)

      theEmail.then( function(result) {

          var from = "insights@meetbrief.com"

          var subject = ""
          subject = result.data.subject;
          subject += " " + result.data.summary + " "
          subject += " " + "(" + result.data.meeting_date_for_display + ")"               
        
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
          cb(msg);

    });
}

exports.reschedule = () => {

  var thisModule = this 
 
// run stoped schedule job.
    Model.Meeting.findAll({
      where: {
        is_sent: null
      }
    }).then(function (meetings) {
      
      Async.each(meetings, function (meeting, cb) {
        
        thisModule.make_email_content(meeting.sender, meeting.meeting_name, meeting.to, meeting.start_time, function (msg) {
          
          //console.log(emoji.get("repeat"), ' rescheduling ---', meeting.meeting_name);
          
          var meetingId = meeting.meeting_name + '_' + moment(meeting.created_time,'YYYYMMDDTHHmmssZ') + '_' + meeting.UserId
          thisModule.schedule_email(meetingId, meeting.start_time, msg, meeting, 'reschedule');
          
          cb(null);
        
        })
      
      }, function (err, result) {
         console.log('\n', 'Restarted all scheduled jobs that have not been sent.', '\n');
      });

  })

}
