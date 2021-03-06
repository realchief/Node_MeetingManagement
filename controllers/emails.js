'use strict';
const sgMail = require('@sendgrid/mail');
const schedule = require('node-schedule');
const moment = require("moment-timezone");
var ical = require('ical')
var _ = require('lodash');

var Model = require('../models');
var Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

var userInfo = require('../controllers/users')
var utilities = require('../controllers/utilities')

exports.meetingFileParse = ( meetingFile ) => {

    return new Promise(function(resolve, reject) {

        console.log( "\n", '+++++++++++ Parse ICS file', meetingFile, 'on', moment().format("ddd, MMMM D [at] h:mma"), "\n" );

        var ical_data = ical.parseFile(meetingFile)  
        var parseIcal = ical_data[Object.keys(ical_data)[0]]
        console.log('============parseIcal==============')
        console.log(parseIcal)
        var insightType = "default"
        var requestType = "request"
        var status = "none"

        console.log('ICAL DATA:', ical_data)

        if ( parseIcal.type == "VTIMEZONE") {
            // can be VEVENT or VTIMEZONE
            console.log("**** VTIMEZONE is the first value in the calendar", "Type:", parseIcal.type)
            parseIcal = ical_data[Object.keys(ical_data)[1]]
        }

        if ( parseIcal.status ) {
          status = parseIcal.status.toLowerCase();
        } else {
          status = "UNKNOWN"
        }

        if ( !parseIcal.created ) {
          parseIcal.created = new Date()
        }

        if ( !parseIcal.dtstamp ) {
          parseIcal.dtstamp = new Date()
        }

        if ( !parseIcal['last-modified'] ) {
          parseIcal['last-modified'] = new Date()
        }

        if ( !parseIcal.sequence ) {
          parseIcal.sequence = 0
        }

        if ( !parseIcal.summary ) {
          parseIcal.summary = "Your MeetBrief"
        }

       

        // not pulling description or location

        //console.log( 'ics data:', parseIcal )

        console.log( 'Organizer Name:', parseIcal.organizer.params.CN, 'Organizer Email:', parseIcal.organizer.val)
        console.log( 'Summary:', parseIcal.summary)
        
        console.log( 'DT Stamp Date:',  moment(JSON.stringify(parseIcal.dtstamp),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
        console.log( 'Created Date:',  moment(JSON.stringify(parseIcal.created),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
        console.log( 'Last Modified:',  moment(JSON.stringify(parseIcal['last-modified']),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
        console.log( 'Sequence:',  parseIcal.sequence )
        console.log( 'Start:', moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
        console.log( 'End:', moment(JSON.stringify(parseIcal.end),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
        console.log( 'Status:', parseIcal.status)

        var isRecurring = false

        if ( parseIcal.rrule ) {
            console.log("\n", emoji.get('game_die'), 'RRULE', parseIcal.rrule.toText(), "\n" )
            var allRecurring = parseIcal.rrule.all();
            var untilDate = parseIcal.rrule.options.until           
            
            var limited_allRecurring = []
            if ( untilDate == null) {
              _.forEach( allRecurring, function( date, index ) {
                if ( index < 6 ) {
                  console.log('Recurring Date>>>', moment(date, 'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma"))                  
                  limited_allRecurring.push(moment(JSON.stringify(date),'YYYYMMDDTHHmmssZ').toDate())
                }
              })
            }
            else {
              _.forEach( allRecurring, function( date, index ) {
                console.log('Recurring Date>>>', moment(date, 'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma"))                  
                limited_allRecurring.push(moment(JSON.stringify(date),'YYYYMMDDTHHmmssZ').toDate())
              })
            }
            isRecurring = true
        }
      
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
                if ( recipient.indexOf('meetbrief') < 0 && recipient.indexOf('getfingertips') < 0 ) {
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


        //var companyId = organizer.replace(/.*@/, "").split('.')[0];
        var companyId = organizer.toLowerCase();
        var emailDomain = organizer.split('@')[1].toLowerCase();

        var summary = parseIcal.summary

        // Microsoft Exchange Server 2010 sends summaries with parameters
        if ( summary.val ) {
            summary = summary.val
            console.log( 'Parsed Summary:', summary)

        }
        
        var sequence = parseIcal.sequence
        var meeting_time_for_display = moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma")
        var meeting_date_for_display = moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D")

        if ( status == "cancelled" || status == "canceled" || status == "cancel" ) {
          requestType = "cancel";
        }

        // get just the file name
        meetingFile = meetingFile.split('uploads/')[1];

        //console.log('Organizer:', organizer, "Company Id", companyId)
        console.log("\n", '+++++++++++ done parsing ics file', "\n" );

        return resolve ( {
            'recipients' : flatRecipients,
            'sendgrid_recipients' : toArray,
            'organizer' : organizer,
            'companyId' : companyId,
            'emailDomain' : emailDomain,
            'summary' : summary,
            'meeting_time_for_display' : meeting_time_for_display,
            'meeting_date_for_display' : meeting_date_for_display,
            'meeting_start_time' : moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').toDate(),
            'meeting_start_time_utc' : moment.utc(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').toDate(),
            'meeting_end_time' : moment(JSON.stringify(parseIcal.end),'YYYYMMDDTHHmmssZ').toDate(),
            'meeting_created' : moment(JSON.stringify(parseIcal.created),'YYYYMMDDTHHmmssZ').toDate(),
            'meeting_dtstamp' : moment(JSON.stringify(parseIcal.dtstamp),'YYYYMMDDTHHmmssZ').toDate(),
            'meeting_sequence' : sequence,
            'meeting_timezone' : null,
            'insight_type' : insightType,
            'request_type' : requestType,
            'status' : status,
            'file_name' : meetingFile,
            'all_recurring_data': limited_allRecurring,
            'untilDate': untilDate,
            'recurring_status': isRecurring
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

    if ( subject && subject.length > 200 ) {
      console.log('!!!!!!!!!!!!! ', 'subject is too long.')
      requestType = "internal"
      //resolve( { type : 'cancel'} );
      return resolve();
    }


    if ( to.toLowerCase().indexOf('neil@meetbrief') >= 0 || to.toLowerCase().indexOf('marty@meetbrief') >= 0 || to.toLowerCase().indexOf('rachel@meetbrief') >= 0 || to.toLowerCase().indexOf('sarah@meetbrief') >= 0 || to.toLowerCase().indexOf('help@meetbrief') >= 0 || to.toLowerCase().indexOf('neil@getfingertips') >= 0 || to.toLowerCase().indexOf('marty@getfingertips') >= 0 || to.toLowerCase().indexOf('rachel@getfingertips') >= 0 || to.toLowerCase().indexOf('sarah@getfingertips') >= 0 || to.toLowerCase().indexOf('help@getfingertips') >= 0  ) {
      console.log('!!!!!!!!!!!!! ', 'this is to a meetbrief team member.', 'Subject:', subject, 'To:', to)
      requestType = "internal"
      //resolve( { type : 'cancel'} );
      return resolve();
    }


    if ( fromEmail.toLowerCase().indexOf('noreply') >= 0 ) {
      console.log('!!!!!!!!!!!!! ', 'noreply email', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      requestType = "internal"
      //resolve( { type : 'cancel'} );
      return resolve();
    }


     if ( fromEmail.toLowerCase().indexOf('bounce') >= 0 ) {
      console.log('!!!!!!!!!!!!! ', 'bounce in from email', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      requestType = "bounce"
      //console.log('Message', message)
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

    if ( subject.toLowerCase().indexOf('out of office') >= 0 || subject.toLowerCase().indexOf('re:') >= 0) {
      console.log('!!!!!!!!!!!!! ', 'vacation reminder in subject', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      requestType = "request"
      return resolve();
    }

     /* ===== default values ======= */
  
    var organizer = fromEmail
    //var companyId = fromEmail.replace(/.*@/, "").split('.')[0];
    var companyId = fromEmail.toLowerCase();
    var emailDomain = fromEmail.split('@')[1].toLowerCase();

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
        if ( recipient.indexOf('meetbrief') < 0 && recipient.indexOf('getfingertips') < 0 ) {
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
            'companyId' : companyId,
            'emailDomain' : emailDomain,
            'summary' : summary,
            'meeting_time_for_display' : meeting_time_for_display,
            'meeting_date_for_display' : meeting_date_for_display,
            'meeting_start_time' : moment().toDate(),
            'meeting_start_time_utc' : moment.utc().toDate(),
            'meeting_end_time' : moment().toDate(),
            'meeting_created' : moment().toDate(),
            'meeting_dtstamp' : moment().toDate(),
            'meeting_sequence' : 0,
            'meeting_timezone' : null,
            'insight_type' : insightType,
            'request_type' : 'request',
            'status' : 'add'
        } )

    }

    })

}

exports.schedule_email = (meetingId, meetingInfo, meetingStart, msg, meeting, from) => {

    var thisModule = this
    // set time 30 minutes before meeting time
    let current_date = moment().toDate();  
    let date = moment(meetingStart,'YYYYMMDDTHHmmssZ').subtract(30, 'minutes').toDate();   
    let current_assert_date = moment().subtract(30, 'minutes').toDate();  
    var from = from || ""

    if ( from == "reschedule") {
      //console.log('++++ rescheduling ---', meeting.summary, '--- to send at ---', moment(date).format("ddd, MMMM D [at] h:mma"));
    }
     // if scheduled date is after the (current time - 30 mimutes)
    let isAfter = moment(date).isAfter(current_assert_date);

     // if the current time is after the scheduled date
    let scheduledIsAfter = moment(current_date).isAfter(date);
    
    //console.log('==== current date:', moment(current_date).format("ddd, MMMM D [at] h:mma"), '--meeting date--', moment(meetingStart).format("ddd, MMMM D [at] h:mma"), '--schedule date--', moment(date).format("ddd, MMMM D [at] h:mma"), '--assert_date--', moment(current_assert_date).format("ddd, MMMM D [at] h:mma"))

     if ( isAfter == false || scheduledIsAfter == true ) {
      isAfter = false
      date = moment().add(20, 'seconds').toDate();
    }

    if ( schedule.scheduledJobs[meetingId] ) {
      console.log( '\n', emoji.get('warning'), ' ', meetingId, ' meeting is already scheduled - un-schedule the existing one' )
      schedule.scheduledJobs[meetingId].cancel()
    }

     console.log('\n', emoji.get('date'), ' schedule email ---', meeting.summary, 'for', moment(meeting.start_time).format("ddd, MMMM D [at] h:mma").underline, 'to send at'.inverse, moment(date).format("ddd, MMMM D [at] h:mma").underline, '--- send later? ---', isAfter, '\n', ' --- meeting id ', meetingId)


    schedule.scheduleJob( meetingId, date, function( data ) {

        thisModule.make_email_content(data.meetingInfo.companyId, data.meetingInfo.organizer, data.meetingInfo.summary, data.meetingInfo.sendgrid_recipients, data.meetingInfo.meeting_start_time, data.meetingInfo.meeting_timezone, function ( err, msg ) {

          console.log('\n', emoji.get('rocket'), ' made and sent scheduled email ---', data.meetingInfo.summary, '---- from ----', data.meetingInfo.organizer, '----', 'for', '---', moment(data.meetingInfo.start_time).format("ddd, MMMM D [at] h:mma"), '----', 'sent at', '-----', moment().format("ddd, MMMM D [at] h:mma"))

          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          sgMail.send( msg );           

          data.meeting.updateAttributes({
           
            is_sent: true
          
          }).then(function ( result ) {
            
            //console.log(emoji.get('thumbsup'), '---- marked as sent: ', result.summary);
          
          });

        })

      }.bind( null , {

          msg: msg,
          meeting: meeting,
          meetingInfo: meetingInfo

      }));
}


exports.cancel = ( user_id, created_time, onFinish ) => {

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

          var meetingId = meeting.summary + '_' + moment(meeting.created_time,'YYYYMMDDTHHmmssZ') + '_' + user_id
          console.log( emoji.get('scissors'), 'remove', meeting.summary, 'which was at:', moment(meeting.start_time).format("ddd, MMMM D [at] h:mma"), 'for meeting_id', meetingId)
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

  //console.log('meeting Info', meetingInfo)

  var thisModule = this;

  Model.Meeting.create({

      to: meetingInfo.recipients,
      summary: meetingInfo.summary,
      organizer: meetingInfo.organizer,
      UserId : user_id,
      meeting_id : meetingId,
      file_name: meetingInfo.file_name,
      start_time: meetingInfo.meeting_start_time,
      end_time: meetingInfo.meeting_end_time, 
      start_date: moment(JSON.stringify(meetingInfo.meeting_start_time),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D"),
      end_date: moment(JSON.stringify(meetingInfo.meeting_end_time),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D"),
      dtstamp_time : meetingInfo.meeting_dtstamp,
      created_time : meetingInfo.meeting_created,
      sequence : meetingInfo.meeting_sequence,
      user_id : meetingInfo.companyId,
      sendgrid_recipients: meetingInfo.sendgrid_recipients,
      is_recurring : meetingInfo.recurring_status,
      recurring_date : meetingInfo.all_recurring_data      
    
    }).then(function ( meeting ) {
       /* ===== modify base email ======= */

          // ---- schedule the email for sending
          console.log('==========meeting info from Meeting table============')
          console.log(meetingInfo.recurring_status) 
          console.log('========================================================')

          if (meetingInfo.recurring_status == false) {
              var msg = null
              thisModule.schedule_email(meetingId, meetingInfo, meetingInfo.meeting_start_time, msg, meeting, 'create');
              onFinish( meetingId )
          }
          else {
              console.log(meetingInfo.all_recurring_data)

              for (var i = 0; i < meetingInfo.all_recurring_data.length; i++) { 
                var msg = null
                console.log(meetingInfo.all_recurring_data[i])
                thisModule.schedule_email(meetingId, meetingInfo, meetingInfo.all_recurring_data[i], msg, meeting, 'create');
                onFinish( meetingId )
              }
          }
    });

}

exports.make_email_content = (user_id, organizer, summary, toArray, start_date, timezone, cb) => {
    
    const EmailContent = require('../components/EmailContent.js');
    var timezone = timezone || "America/New_York"
    
    var sender = organizer
    var companyId = user_id
    //var meeting_time_for_display = moment(start_date).format("ddd, MMMM D [at] h:mma")
    var meeting_date_for_display = moment(start_date).format("ddd, MMMM D")
    var meeting_time_for_display = moment(start_date).tz(timezone).format("ddd, MMMM D [at] h:mma")

    userInfo.getInsightsFromId( companyId, function( err, results ) {

      var email = JSON.parse(JSON.stringify(EmailContent.email));
      var emailDomain = results.credentials.user.email_domain

      if ( EmailContent['email_' + companyId] || EmailContent['email_' + emailDomain] ) {
        email = JSON.parse(JSON.stringify(EmailContent['email_' + companyId]));
      }

      email.replacements.sender = sender
      email.replacements.summary = summary
      email.replacements.meeting_time_for_display = meeting_time_for_display
      email.replacements.meeting_date_for_display = meeting_date_for_display

      if ( results.credentials.user.id ) {

        var bucket_insights = results.results.insights.data.bucket_insights

        var realReplacements = {
          sender: organizer,
          summary: summary,
          brand: results.credentials.user.company.company_name,
          headline: "Here is your MeetBrief comparing this week to last week.",
          interest_change: utilities.filter(bucket_insights.buckets, 'name', 'user_interest')[0].positiveMappingsCount - utilities.filter(bucket_insights.buckets, 'name', 'user_interest')[0].negativeMappingsCount,
          interest_score: utilities.filter(bucket_insights.buckets, 'name', 'user_interest')[0].totalScore,
          interest_status: utilities.filter(bucket_insights.buckets, 'name', 'user_interest')[0].mappingsStatus,
          interest_chart: 'chart-1.png',
          engagement_change: utilities.filter(bucket_insights.buckets, 'name', 'user_engagement')[0].positiveMappingsCount - utilities.filter(bucket_insights.buckets, 'name', 'user_engagement')[0].negativeMappingsCount,
          engagement_score: utilities.filter(bucket_insights.buckets, 'name', 'user_engagement')[0].totalScore,
          engagement_status: utilities.filter(bucket_insights.buckets, 'name', 'user_engagement')[0].mappingsStatus,
          engagement_chart: 'chart-1.png',
          demand_change: utilities.filter(bucket_insights.buckets, 'name', 'demand')[0].positiveMappingsCount - utilities.filter(bucket_insights.buckets, 'name', 'demand')[0].negativeMappingsCount,
          demand_score: utilities.filter(bucket_insights.buckets, 'name', 'demand')[0].totalScore,
          demand_status: utilities.filter(bucket_insights.buckets, 'name', 'demand')[0].mappingsStatus,
          demand_chart: 'chart-3.png',
          action_items: results.results.insights.data.action_items,
          talking_points: results.results.insights.data.talking_points
        }  

        _.forEach( realReplacements, function( value, key ){
             email.replacements[key] = value
        })

      }

      var theEmail = EmailContent.processEmail(email)

      theEmail.then( function( result ) {

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

          cb( null, msg );

    });


    })

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
        
          var meetingId = meeting.summary + '_' + moment(meeting.created_time,'YYYYMMDDTHHmmssZ') + '_' + meeting.UserId
          
          var msg = null

          meeting.meeting_start_time = meeting.start_time
          meeting.companyId = meeting.user_id
          thisModule.schedule_email(meetingId, meeting, meeting.start_time, msg, meeting, 'reschedule');
          
          cb(null);
        
      }, function (err, result) {
         
         console.log('\n', 'Restarted all scheduled jobs that have not been sent.', '\n');
      
      });

  })

}
