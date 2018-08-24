var _ = require('lodash');
var moment = require('moment');
var Model = require('../models');
var emails = require('../controllers/emails');

var colors = require('colors');
var emoji = require('node-emoji')

exports.processMeetingRequest = ( meetingInfo, cb ) => {

  console.log(emoji.get('trumpet'), emoji.get('trumpet'), '------ meeting info from incoming request ----', '\n', meetingInfo)

     if ( !meetingInfo ) {
      console.log('!!! meeting info is blank.', '\n', meetingInfo)
      //res.sendStatus(200);
      cb(meetingInfo)
      console.log('\n', emoji.get('eyes'), ' process end ===============================', '\n')
      return
    }
   
    // LOOK UP USER FROM REQUEST COMPANY_ID
    let whereClause = { 'company_id' : meetingInfo.emailDomain }
    Model.User.findOne({

        where: whereClause

    }).then(function (user) {

       if (!user) {
          var user_id = null
       } else {
          var user_id = user.id
       }

       var meetingId = meetingInfo.summary + '_' + moment(meetingInfo.meeting_created,'YYYYMMDDTHHmmssZ') + '_' + user_id

       // SEE IF THERE IS AN EXISTING MEETING
       let whereClause = { 'meeting_id' : meetingId, 'is_sent' : null }
       Model.Meeting.findOne({

        where: whereClause

        }).then(function (meeting) {

             /* SEE IF THERE IS AN EXISTING MEETING BASED ON THE MEETING_ID */
             if (!meeting) {

                console.log('\n', emoji.get('trumpet'), 'We did not find an existing meeting.')
            
             } else {
                
                console.log('\n', emoji.get('trumpet'), 'We found an existing meeting.', meeting.meeting_id, meeting.sequence )

                if ( meeting.sequence == meetingInfo.sequence) {
                  console.log('\n', emoji.get('trumpet'), 'Sequence numbers match, so no changes' )
                } else {
                  console.log('\n', emoji.get('trumpet'), 'Sequence numbers dont match, we need to make a change' )
                  if ( meetingInfo.request_type != "cancel" ) meetingInfo.request_type = "update"
                  // cancel and add? or update and save?
                }

             }

            /* UPDATE THE MEETING by CANCELLING AND CREATING */
             if ( meetingInfo.request_type == "update") {

                  emails.cancel( user_id, meetingInfo.meeting_created, function(meetings) {
                  
                  console.log(emoji.get('mute'), 'we have cancelled this existing meeting:', meetings)
                  
                  emails.create( user_id, meetingId, meetingInfo, function(meeting) {
                
                    //res.sendStatus(200);
                    cb(meetingInfo)
                    console.log('\n', emoji.get('eyes'), ' process end update ===============================', '\n')
                    return

                  })


               })

            }

            /* CANCEL THE MEETING */
            if ( meetingInfo.request_type == "cancel") {
              
              console.log('\n', emoji.get('trumpet'), emoji.get('trumpet'),  '!-----','this is a cancel request for', meetingInfo.summary, 'from', meetingInfo.emailDomain, 'for', moment(meetingInfo.meeting_start, 'YYYYMMDDTHHmmssZ').format("ddd, MMMM D [at] h:mma"), '\n')
              
              emails.cancel( user_id, meetingInfo.meeting_created, function(meetings) {
                  
                  console.log(emoji.get('mute'), 'we have cancelled these meetings:', meetings)
                  //res.sendStatus(200);
                  cb(meetingInfo)
                  console.log('\n', emoji.get('eyes'), ' process end cancel ===============================', '\n')
                  return

               })
              
            } 

            /* CREATE THE MEETING */
             if ( meetingInfo.request_type == "request" && !meeting) {
            
              emails.create( user_id, meetingId, meetingInfo, function(meeting) {
                //res.sendStatus(200);
                cb(meetingInfo)
                console.log('\n', emoji.get('eyes'), ' process end create ===============================', '\n')
                return

              })

            }


            /* SEND A RESPONSE IF WE DIDNT UPDATE A MEETING */
            if ( meetingInfo.request_type == "request" && meeting ) {
              //res.sendStatus(200);
              cb(meetingInfo)
              console.log('\n', emoji.get('eyes'), ' process no changes ===============================', '\n')
              return
            }

        })

    
    })

}