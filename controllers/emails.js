'use strict';
const sgMail = require('@sendgrid/mail');
const schedule = require('node-schedule');

exports.schedule_email = (date, msg, meeting) => {

     console.log('---- schedule email ---', meeting.meeting_name, '----', 'for', '---', moment(meeting.start_time).format("ddd, MMMM D [at] h:mma"), '----', 'to send at', '-----', moment(date).format("ddd, MMMM D [at] h:mma"))
      

    schedule.scheduleJob(date, function(data) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        sgMail.send(data.msg);           
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
    let meeting_time = moment(start_date).format("ddd, MMMM D [at] h:mma")
    let meeting_date = moment(start_date).format("ddd, MMMM D")

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
          cb(msg);

        });
}