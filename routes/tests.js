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

// set up all phrases
var talkingPoints = require('../schemas/phrases-talking-points');
var insights = require('../schemas/phrases-insights');
var phrases = require('../schemas/phrases');

router.get('/testsocial/:company', function (req, res) {

  //console.log('PHRASES>>>', phrases)

  /*_.forEach(insights.phrases, function(phrase, index) {
    console.log('phrase>>>>', phrase.phrase, phrase.tags)
  })*/

  const Async = require('async');
  const graph = require('fbgraph');
  const {google} = require('googleapis');
  const OAuth2 = google.auth.OAuth2;
  const auth = require('../config/auth');

  let company = req.params.company;
  let type = ( isNaN(Number(company)) ) ? 'company_id' : 'id'

  let whereClause = ( type == "company_id" ) ? { 'company_id' : company } : { 'id' : company }

  Model.User.findOne({
      where: whereClause
  }).then(function (user) {
  
      if (!user) {
          console.log('>>> Cant Find user', user)
          res.send("No User Found")
          return
      }
    
    let token = "";
  
    Async.parallel({

      retrieveFacebookUser : function( done ) {

        user.getFacebook().then(function (fUser) {
          if (fUser) {
              console.log( 'Facebook User>>>', fUser.id)
          }

          done( null, fUser )

        })

      },

      retrieveGoogleUser : function ( done ) {

        user.getGoogle().then(function (gUser) {
          if (gUser) {
              console.log( 'Google User>>>', "id", gUser.id )
          }

          done( null, gUser )

        })

      }

    },

    function ( err, results ) {

            //console.log('Results>>>', results)
            
            Async.parallel({
                  getFacebookData: (done) => {
                      
                      if ( results.retrieveFacebookUser  == null  ) {
                        done( err, 'no facebook data')
                        return
                      }

                      let fUser = results.retrieveFacebookUser

                      graph.setAccessToken(fUser.token);
                      graph.get("me/?fields=name,first_name,middle_name,last_name,email,accounts{name,global_brand_page_name,id,access_token,link,username}", (err, response) => {
                          //console.log('get facebook data - me', me)
                          done(err, response);
                      });
                  },

                  getGoogleData : (done) => {

                      if ( results.retrieveGoogleUser == null ) {
                        done( err, { data: 'no google data'})
                        return
                      }

                      let gUser = results.retrieveGoogleUser

                      let oauth2Client = new OAuth2(
                          auth.googleAuth.clientID,
                          auth.googleAuth.clientSecret,
                          auth.googleAuth.callbackURL
                      );

                      oauth2Client.credentials = {
                          refresh_token: gUser.refresh_token,
                          expiry_date: gUser.expiry_date,
                          access_token: gUser.token,
                          token_type: gUser.token_type,
                          id_token: gUser.id_token
                      }
                      google.options({
                          auth: oauth2Client
                      });


                       console.log('>>>>>> google refresh token:', gUser.refresh_token, 'seconds before expiry', moment().subtract(gUser.expiry_date, "s").format("X"), 'google access token:', gUser.token)

                      // IF FAIL, WE PROBABLY NEED TO REFRESH THE TOKEN. HOW?

                      /* ACCOUNTS ==== */

                      const analytics = google.analytics({
                        version: 'v3',
                      });


                       Async.parallel({

                          accountSummaries : (done) => {

                            analytics.management.accountSummaries.list(function (err, response) {

                                if (err) {
                                  console.log('Google API error:', err);
                                  return;
                                }

                              // console.log('get google data - account all', response.data)
                            
                                if (response && !response.error) {
                                   //console.log('get google data - account summary', response.data)
                                    done(null, response);
                                } else {
                                   //console.log('get google data - account summary error', response.data)
                                    done(null, response);
                                }
                            });

                          },

                          goals : (done) => {

                            /* GOALS ==== */
                            analytics.management.goals.list({
                              'accountId': gUser.account_id,
                              'webPropertyId': gUser.property_id,
                              'profileId': gUser.view_id },

                              function (err, response) {

                                if (err) {
                                  console.log('Google API error:', err);
                                }

                                var goals = [];
                                var metrics = [];

                                if ( typeof response.data != 'undefined') {

                                  //console.log(response.result.items)

                                  _.each( response.data.items, function(goal, index) {
                                    
                                    var details = ""
                                    if (goal.urlDestinationDetails) {
                                      details = goal.urlDestinationDetails
                                    } else if (goal.eventDetails) {
                                       details = goal.eventDetails
                                     }

                                     goals.push( {
                                      id : goal.id,
                                      name : goal.name,
                                      type : goal.type,
                                      details : details
                                     })

                                     metrics.push( {  
                                      metricName: 'ga:goal' + goal.id + 'Completions',
                                      name : goal.name
                                     })

                                  })

                                }
                                
                                done(null, { goals : goals, metricNames : metrics });                              
                                //console.log('Google API goals response:', goals, metrics)
                            });

                          },

                          metrics : (done) => {

                            /* METRICS ==== */

                            const analyticsreporting = google.analyticsreporting({
                              version: 'v4',
                            });

                            var currentSince = moment('2018-08-14').format( "YYYY-MM-DD" );
                            var currentUntil = moment('2018-08-20').format( "YYYY-MM-DD" );
                            var comparedSince = moment( '2018-08-07' ).format( "YYYY-MM-DD" );
                            var comparedUntil = moment( '2018-08-13' ).format( "YYYY-MM-DD" );

                            var dateRanges = [
                            {
                              startDate: currentSince,
                              endDate: currentUntil
                            },
                            {
                             startDate: comparedSince,
                              endDate: comparedUntil
                            }
                            ]

                            analyticsreporting.reports.batchGet({
                              "requestBody": {
                                reportRequests: [{
                                  viewId: gUser.view_id,
                                  dateRanges: dateRanges,
                                  metrics: [
                                    {
                                      expression: 'ga:users'
                                    }
                                  ]
                                }]
                              }}, function ( err, response ) {
                              
                                if (err) {
                                  console.log('Google API error:', err);
                                }

                                done(null, response.data.reports);
                                //console.log('Google API Metrics response:', response.data.reports)

                              })

                              },
                          
                          }, (err, results) => {

                                  console.log('METRIC PULL RESULTS', results)
                                  
                                  done(null, {
                                    accountSummaries : results.accountSummaries,
                                    goals : results.goals,
                                    metrics : results.metrics
                                  });

                            })       

                    }

              },
              
              (err, result) => {

                  let output = JSON.stringify(result.getFacebookData)
                  
                  output += JSON.stringify(result.getGoogleData.accountSummaries.data) 
                  output += JSON.stringify(result.getGoogleData.goals.goals) 
                  output += JSON.stringify(result.getGoogleData.metrics[0].data) 

                  //console.log('returned facebook>>>>', result.getFacebookData)
                  //console.log('returned google>>>>', result.getGoogleData)

                    res.render('fingertips', {
                        layout: 'social-test.handlebars',
                        company : company,
                        user : user,
                        data: output
                    });

                });

          })
    })

})



router.get('/testsched', function (req, res) {

  var testDate = moment().add(10, 'seconds').toDate();;
  console.log('====================testDate===========================');
  console.log(testDate);

  var content = "Email" + testDate
  res.send('testing a date scheduler for ' + testDate)

  var j = schedule.scheduleJob(testDate, function(data){
    console.log('Schedule!', data.testDate, content);
  }.bind(null, {
    testDate : testDate
  }))

})



router.get('/send', function (req, res) {

  // ,sarah@loosegrip.net
  var to = 'martymix@gmail.com'
  console.log('=========== page refresh show attempt:', to)

  var email = JSON.parse(JSON.stringify(EmailContent.email_lg));

  email.replacements.summary = "LooseGrip Email";
  email.replacements.meeting_time_for_display = moment().format("ddd, MMMM D [at] h:mma")
  email.replacements.meeting_date_for_display = moment().format("ddd, MMMM D")
  
   var theEmail = EmailContent.processEmail(email)

   theEmail.then( function(result) {

    var recipients = to.split(',')

    var from = "insights@meetbrief.com"
      
      var subject = ""

      subject = result.data.subject;
      subject += " " + result.data.summary + " "
      subject += " " + "(" + result.data.meeting_date_for_display + ")"

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

  console.log('=========== user controlled send attempt:', req.body.to)

  var theEmail = EmailContent.processEmail(req.body)

   theEmail.then( function(result) {

      var to = req.body.to
      var recipients = req.body.to.split(',')

      var from = "insights@meetbrief.com"
      var toArray = [];

      var subject = ""
      subject = result.data.subject;
      subject += " " + result.data.summary + " "
      subject += " " + "(" + result.data.meeting_date_for_display + ")"
    
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


module.exports = router