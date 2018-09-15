var express = require('express');
var router = express.Router();
var request = require('request')
var multer  = require('multer')
var fs = require('fs')
const sgMail = require('@sendgrid/mail');
var _ = require('lodash');
var ical = require('ical');
var Async = require('async');
var moment = require('moment');
var Model = require('../models');
var schedule = require('node-schedule');
var dates = require('../controllers/dates');

let facebookApi = require('../controllers/facebook-api');
let googleApi = require('../controllers/google-analytics-api');

var colors = require('colors');
var emoji = require('node-emoji')

var userInfo = require('../controllers/users')

// email content function
const EmailContent = require('../components/EmailContent.js')

router.get('/testsocial/:company', function (req, res) {

  const Async = require('async');
  const graph = require('fbgraph');
  const {google} = require('googleapis');
  const OAuth2 = google.auth.OAuth2;
  const auth = require('../config/auth');

  var company = req.params.company

  userInfo.getConnectedAccountsFromId(company, function( err, results ) {

            Async.parallel({

                  getFacebookData: (done) => {
                      
                      if ( results.facebookUser  == null  ) {
                        done( err, 'no facebook data')
                        return
                      }

                      let fUser = results.facebookUser

                      graph.setAccessToken( fUser.token);
                      graph.get("me/?fields=name,first_name,middle_name,last_name,email,accounts{name,global_brand_page_name,id,access_token,link,username}", (err, response) => {
                          //console.log('get facebook data - me', me)
                          done(err, response);
                      });
                  },

                  getGoogleData : (done) => {

                      if ( results.googleUser == null ) {
                        done( err, { data: 'no google data'})
                        return
                      }

                      // Set the global Google credentials for the user //

                      let gUser = results.googleUser

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


                       console.log('\n', emoji.get("information_source"),'>>>>>> google refresh token:', gUser.refresh_token, 'seconds before expiry', moment().subtract(gUser.expiry_date, "s").format("X"), 'google access token:', gUser.token)

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


                            var defaultNumDays = 7
                            var range = dates.getDateRangeNumDays(defaultNumDays);
                            var defaultDates = dates.setDateWindow(range)
                            
                            console.log(emoji.get("sparkles"), 'current from  ', defaultDates.currentFromDate)
                            console.log(emoji.get("sparkles"), 'current to ',defaultDates.currentToDate)
                            console.log(emoji.get("sparkles"), 'compared from  ',defaultDates.comparedFromDate)
                            console.log(emoji.get("sparkles"), 'compared to ',defaultDates.comparedToDate)


                            var currentSince = moment( defaultDates.currentFromDate ).format( "YYYY-MM-DD" );
                            var currentUntil = moment( defaultDates.currentToDate ).format( "YYYY-MM-DD" );
                            var comparedSince = moment( defaultDates.comparedFromDate ).format( "YYYY-MM-DD" );
                            var comparedUntil = moment( defaultDates.comparedToDate ).format( "YYYY-MM-DD" );

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

                                  //console.log('METRIC PULL RESULTS', results)
                                  
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
                        user : results.user,
                        data: output
                    });

                });

    })

})


router.get('/chart/:chart', function (req, res) {

  var chartNumbers = req.params.chart

  var chartArray = req.params.chart.split(',')

  res.send(chartArray)

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
  console.log('\n', emoji.get('eyes'), ' page refresh show attempt:', to)

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

  console.log('\n', emoji.get('eyes'), ' user controlled send attempt:', req.body.to)

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

      console.log('\n', emoji.get('email'), ' email sent to: ',  to ) 
   })

}),



router.get('/testphrase/', function (req, res) {

  var phraseMaker = require('../controllers/phrases');
  var talkingPointsPhrases = require('../definitions/phrases-talking-points');
  var insightsPhrases = require('../definitions/phrases-insights');
 
  var talkingPointsList = talkingPointsPhrases.get();
  var insightsList = insightsPhrases.get();

  var allPoints = [];
  var allInsights = [];
  var filteredPoints = [];
  var filteredInsights = [];

  _.forEach(talkingPointsList, function(phrase,index) {
      allPoints.push(phraseMaker.make(phrase))
  })

  _.forEach(insightsList, function(phrase,index) {
      allInsights.push(phraseMaker.make(phrase))
  })

  var filteredPoints = phraseMaker.matchingAllTagsFilter(allPoints, ['google_analytics', 'positive', 'pageviews'])
  var filteredInsights = phraseMaker.matchingAllTagsFilter(allInsights, ['google_analytics', 'positive', 'pageviews'])


  /* lets replace the {{}} areas */

  var replacements = {
      value: 500,
      compared_value: 600,
      total_delta : 100,
      percent_change : Math.abs(30.44456).toFixed(2) + '%',
      primary_dimension : 'nothing'
  };

  var filteredReplacedPoints = phraseMaker.replace( filteredPoints, replacements )
  var filteredReplacedInsights = phraseMaker.replace( filteredInsights, replacements )


  /* Test asset links */

  var assetLinks = require('../definitions/asset-links');
  var assetLinksList = assetLinks.get();
  console.log( emoji.get("sparkles"), 'Asset links list', assetLinksList )

  /* Test buckets */

  var bucketDefinition = require('../definitions/buckets');
  var bucketList = bucketDefinition.get();
  console.log( emoji.get("sparkles"), 'Buckets', bucketList )

  /* Test platform */

  var platformDefinition = require('../definitions/platform');
  var platformList = platformDefinition.get();
  console.log( emoji.get("sparkles"), 'Platform', platformList )

  /* Test google source */

  var googleAnalyticsDefinition = require('../definitions/source-google-analytics');
  var googleAnalyticsData = googleAnalyticsDefinition.get();
  console.log( emoji.get("sparkles"), 'Google', googleAnalyticsData )

  /* Test facebook source */

  var facebookDefinition = require('../definitions/source-facebook');
  var facebookData = facebookDefinition.get();
  console.log( emoji.get("sparkles"), 'Facebook', facebookData )

  /* Test facebook source */

  var insightsDefinition = require('../definitions/insights');
  var insightsList = insightsDefinition.get();
  console.log( emoji.get("sparkles"), 'insights', insightsList )


  console.log( emoji.get("sparkles"), 'Platform pageview asset links', platformList.all.metrics.pageviews )

  res.render('fingertips', {
        layout: 'phrases-test.handlebars',
        allPoints : allPoints,
        allInsights : allInsights,
        filteredPoints : filteredPoints,
        filteredInsights : filteredInsights,
        filteredReplacedPoints : filteredReplacedPoints,
        filteredReplacedInsights : filteredReplacedInsights        
    });


}),


router.get('/testdates/', function (req, res) {

  
    var dates = require('../controllers/dates');
    var output = [];

    // using the day before today as the start date
    // console.log( emoji.get("sparkles"), dates.getDateRangeNumDays(3) )
    // console.log( emoji.get("sparkles"), dates.getDateRangeNumDays(3, 'on') )
    // console.log( emoji.get("sparkles"), dates.getDateRangeNumDays(7) )
    // console.log( emoji.get("sparkles"), dates.getDateRangeNumDays(28) )
    // console.log( emoji.get("sparkles"), dates.getDateRangeNumDays(30) )

    // using the day before today as the start date
    // console.log( emoji.get("sparkles"), dates.getDateRangeNumDays(3) )
    // console.log( emoji.get("sparkles"), dates.getDateRangeNumDays(3, 'on') )
    // console.log( emoji.get("sparkles"), dates.getDateRangeNumDays(7) )
    // console.log( emoji.get("sparkles"), dates.getDateRangeNumDays(28) )
    // console.log( emoji.get("sparkles"), dates.getDateRangeNumDays(30) )

    // console.log( emoji.get("sparkles"), dates.getDateRange('week') )
    // console.log( emoji.get("sparkles"), dates.getDateRange('isoWeek') )
    // console.log( emoji.get("sparkles"), dates.getDateRange('month') )
    // console.log( emoji.get("sparkles"), dates.getDateRange('quarter') )
    // console.log( emoji.get("sparkles"), dates.getDateRange('year') )

    // console.log( emoji.get("sparkles"), dates.getDateRange('week', "on") )
  
    // console.log( emoji.get("sparkles"), dates.getDateRangeUpToThis('week') )
    // console.log( emoji.get("sparkles"), dates.getDateRangeUpToThis('isoWeek') )
    // console.log( emoji.get("sparkles"), dates.getDateRangeUpToThis('month') )
    // console.log( emoji.get("sparkles"), dates.getDateRangeUpToThis('quarter') )
    // console.log( emoji.get("sparkles"), dates.getDateRangeUpToThis('year') )

    // console.log( emoji.get("sparkles"), dates.getDateRangeUpToThis('month', "on") )
    // console.log( emoji.get("sparkles"), dates.getDateRangeUpToThis('quarter', "on") )
    // console.log( emoji.get("sparkles"), dates.getDateRangeUpToThis('year', "on") )

    // compared to last meeting, same timeframe to compare to
    
    // console.log( emoji.get("sparkles"), dates.getDateRangeSince('2018-02-18') )
    // console.log( emoji.get("sparkles"), dates.getDateRangeSince('2018-02-18', 'on') )
    
    // since last meeting - but compared to an arbitrary before "since" (meeting 2 months ago, perhaps)
    
    // console.log( emoji.get("sparkles"), dates.getDateRangeSincePreLastDate('2018-02-18', '2018-02-10') )

    // between a date range, compared to same timeframe
    
    // console.log( emoji.get("sparkles"), dates.getDateRangeBetween('2018-02-10', '2018-02-20') )
    // console.log( emoji.get("sparkles"), dates.getDateRangeBetween('2018-02-10', '2018-02-20', 'on') )

    // between two date ranges
    
    // console.log( emoji.get("sparkles"), dates.getDateRangeBetweenCustom('2018-02-10', '2018-02-20', '2018-01-15', '2018-01-19') )

    var card = dates.getDateRangeNumDays(7).card

    /* set date for all */
    var defaultNumDays = 7
    var range = dates.getDateRangeNumDays(defaultNumDays);
    var defaultDates = JSON.stringify(dates.setDateWindow(range))

    res.render('fingertips', {
        layout: 'dates-test.handlebars',
        dates : defaultDates

    })


})

router.get('/phrasetestdb/', function (req, res) {

  var phraseMaker = require('../controllers/phrases');

  let whereClause = { type : 'insight' }

  Model.Phrase.findAll({
      where: whereClause
  }).then(function (phrases) {
  
    var allInsights = []

     _.forEach(phrases, function(phrase,index) {
        allInsights.push( { 
            id : phrase.id,
            phrase : phrase.phrase + ' ' + phrase.id,
            all_tags : phrase.all_tags
        })
    })


     var filteredInsights = phraseMaker.matchingAllTagsFilter(allInsights, ['google_analytics', 'positive', 'pageviews'])

    res.render('fingertips', {
        layout: 'phrases-test.handlebars',
       // allPoints : allPoints,
        allInsights : allInsights,
       // filteredPoints : filteredPoints,
        filteredInsights : filteredInsights    

    })


  })

})


router.get('/tokens/facebook/:company',  function (req, res) {
    
    var userId = req.params.company ? req.params.company : req.user.id

    if ( req.params.company == "loggedin") {

       if ( req.user ) {
           userId = req.user.id
        } else {
            req.session.redirectTo = "/data/combined/loggedin"
            res.redirect('/signin');
            return
       }

    }

    userInfo.getConnectedAccountsFromId(userId, function( err, results ) {

      facebookApi.extendToken(results.facebookUser, res, function( result ) {
        res.send(result)
      })

    })

})


router.get('/insightsobj', function (req, res) {

  var insights = require('../controllers/insights')

  console.log('\n', emoji.get("information_source"), "insights listing", insights.makeInsightsList() )

})

/* 
 * / end MARIN'S TEST STUFF 
 */

module.exports = router