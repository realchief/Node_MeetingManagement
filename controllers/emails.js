'use strict';
const sgMail = require('@sendgrid/mail');
const schedule = require('node-schedule');
const moment = require("moment");
var ical = require('ical')
var _ = require('lodash');

exports.meetingFileParse = ( meetingFile ) => {

    return new Promise(function(resolve, reject) {

        console.log( '+++++++++++ Parse ICS file', meetingFile );

        var ical_data = ical.parseFile(meetingFile)  
        var parseIcal = ical_data[Object.keys(ical_data)[0]]
        var insightType = "default"

        if ( parseIcal.type == "VTIMEZONE") {
            console.log("**** FROM ICAL Object")
            parseIcal = ical_data[Object.keys(ical_data)[1]]
        }

        // let date = moment().add(2, 'minutes').toDate();
        // let current_assert_date = moment().add(3, 'minutes').toDate();
        // ---------------for testing----------------------  

        // parseIcal.start = moment().add(2, 'minutes').toDate()
        // parseIcal.end = moment().add(1, 'minutes').toDate()

        console.log( 'Organizer Name:', parseIcal.organizer.params.CN, 'Organizer Email:', parseIcal.organizer.val)
        console.log( 'Start Unformatted:', JSON.stringify(parseIcal.start), 'End:', JSON.stringify(parseIcal.end) )
        console.log( 'Start:', moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
        console.log( 'End:', moment(JSON.stringify(parseIcal.end),'YYYYMMDDTHHmmssZ').format("dddd, MMMM Do YYYY, h:mma") )
        console.log( 'Summary:', parseIcal.summary)

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
        var meeting_time_for_display = moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma")
        var meeting_date_for_display = moment(JSON.stringify(parseIcal.start),'YYYYMMDDTHHmmssZ').format("ddd, MMMM D")

        //console.log('Organizer:', organizer, "Company Id", emailDomain)
        console.log( '+++++++++++ END PARSE ICS FILE' );

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
            'insight_type' : insightType,
            'type' : 'request'
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


     if ( fromEmail.indexOf('bounce') >= 0 ) {
      console.log('!!!!!!!!!!!!! ', 'bounce! do not send!!', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      //resolve( { type : 'cancel'} );
      return resolve();
    }

    if ( subject.indexOf('cancelled') >= 0 ) {
      console.log('!!!!!!!!!!!!! ','cancelled subject! do not send!!', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      //resolve( { type : 'cancel'} );
      return resolve();
    }

    if ( subject.indexOf('canceled') >= 0 ) {
      console.log('!!!!!!!!!!!!! ', 'cancelled subject! do not send!!', 'From:', fromEmail, 'Subject:', subject, 'To:', to)
      //resolve( { type : 'cancel'} );
      return resolve();
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
            'insight_type' : insightType,
            'type' : 'request'
        } )

    }

    })

}


exports.schedule_email = (date, msg, meeting) => {

    console.log('---- schedule email ---', meeting.meeting_name, '----', 'for', '---', moment(meeting.start_time).format("ddd, MMMM D [at] h:mma"), '----', 'to send at', '-----', moment(date).format("ddd, MMMM D [at] h:mma"))

    schedule.scheduleJob(date, function(data) {

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        //sgMail.send(data.msg);           
        console.log('---- send scheduled email ---', data.meeting.meeting_name, '----', 'for', '---', moment(data.meeting.start_time).format("ddd, MMMM D [at] h:mma"), '----', 'sent on', '-----', moment().format("ddd, MMMM D [at] h:mma"))
        data.meeting.updateAttributes({
          is_sent: true
        }).then(function (result) {
          console.log('---- marked as sent: ', result.meeting_name);
        });

      }.bind(null,{

        msg: msg,
        meeting: meeting

      }));
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