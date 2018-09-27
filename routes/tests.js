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

var userInfo = require('../controllers/users')
var utilities = require('../controllers/utilities')

// email content function
const EmailContent = require('../components/EmailContent.js')

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



router.get('/send/:company', function (req, res) {

  var to = 'martymix@gmail.com'
  console.log('\n', emoji.get('eyes'), ' email example:')

  // ADD REAL CONTENT TO THE EMAIL //

  var userId = req.params.company

  userInfo.getInsightsFromId( userId, function( err, results ) {

    if ( err ) {
       
        var errorMessage = 'Error from userInfo.getInsightsFromId in send/:company' + ' - ' + err.message
        res.send( errorMessage )

    } else {

      var email = JSON.parse(JSON.stringify(EmailContent.email));

      //var meeting_time_for_display = moment(start_date).format("ddd, MMMM D [at] h:mma")
      //var timezone = "America/New_York"
      var theTimezone = null
      var timezone = theTimezone || "America/New_York"
      var meeting_time_for_display = moment().tz(timezone).format("ddd, MMMM D [at] h:mma")

      email.replacements.summary = "LooseGrip Email";
      email.replacements.meeting_time_for_display = meeting_time_for_display
      email.replacements.meeting_date_for_display = moment().format("ddd, MMMM D")

      if ( results.credentials.user.id ) {

        var bucket_insights = results.results.insights.data.bucket_insights

        var realReplacements = {
          sender: results.credentials.user.email,
          summary: results.credentials.user.company_name + ' ' + 'Email',
          brand: results.credentials.user.company_name,
          headline: "This is a headline from a real parsed endpoint.",
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

      // END ADD REAL CONTENT TO THE EMAIL //

     var theEmail = EmailContent.processEmail(email)

     theEmail.then( function( result ) {

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

    }


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


router.get('/send-generic/:company', function (req, res) {

  var to = 'martymix@gmail.com'
  console.log('\n', emoji.get('eyes'), ' email example:')

  // ADD REAL CONTENT TO THE EMAIL //

  var userId = req.params.company

  userInfo.getLinkedAccountsFromId( userId, function( err, results ) {

    var email = JSON.parse(JSON.stringify(EmailContent.email_generic));

    //var meeting_time_for_display = moment(start_date).format("ddd, MMMM D [at] h:mma")
    //var timezone = "America/New_York"
    var theTimezone = null
    var timezone = theTimezone || "America/New_York"
  
    email.template = "generic"

    if ( results.user.id ) {

      var realReplacements = {
        body: "This is a test",
      }  

      _.forEach( realReplacements, function( value, key ){
           email.replacements[key] = value
      })

    }

    // END ADD REAL CONTENT TO THE EMAIL //

   var theEmail = EmailContent.processEmail(email)

   theEmail.then( function( result ) {

      var recipients = to.split(',')

      var from = "insights@meetbrief.com"
        
        var subject = ""

        subject = result.data.subject;
      
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

 
})


router.get('/testphrase/', function (req, res) {

  var phraseMaker = require('../controllers/phrases');
  var talkingPointsPhrases = require('../definitions/phrases-talking-points');
  var insightsPhrases = require('../definitions/phrases-insights');
 
  var talkingPointsList = talkingPointsPhrases.get();
  var insightsList = insightsPhrases.get();

  var allTalkingPoints = [];
  var allInsights = [];
  var filteredPoints = [];
  var filteredInsights = [];

  _.forEach(talkingPointsList, function(phrase,index) {
      allTalkingPoints.push(phraseMaker.make(phrase))
  })

  _.forEach(insightsList, function(phrase,index) {
      allInsights.push(phraseMaker.make(phrase))
  })

  var filteredPoints = phraseMaker.matchingAllTagsFilter(allTalkingPoints, ['google_analytics', 'positive', 'pageviews'])
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
        allTalkingPoints : allTalkingPoints,
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
    var defaultNumDays = 28
    var range = dates.getDateRangeNumDays(defaultNumDays);
    var defaultDates = JSON.stringify(dates.setDateWindow(range))

    res.render('fingertips', {
        layout: 'dates-test.handlebars',
        dates : defaultDates

    })


})

router.get('/phrasetestdb/', function (req, res) {

  var phraseMaker = require('../controllers/phrases');

  phraseMaker.getPhrasesFromDb().then( function( phrases ) {
      
      console.log('got phrases from DB')
        
       var filteredInsights = phraseMaker.matchingAllTagsFilter(phrases.allInsights, ['google_analytics', 'positive', 'pageviews'])

      res.render('fingertips', {
        layout: 'phrases-test.handlebars',
       // allTalkingPoints : allTalkingPoints,
        allInsights : phrases.allInsights,
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

    userInfo.getLinkedAccountsFromId(userId, function( err, results ) {

      facebookApi.extendToken(results.accounts.facebook, res, function( result ) {
        res.send(result)
      })

    })

})

router.get('/settings',  function (req, res) {
  if (!req.user) {
      return res.redirect('/signin')
  }
  else {
      Async.waterfall([
          function ( cb ) {   

              req.user.getSetting().then(function (setting) {
                  if (setting) {
                      cb(null, setting)
                  }
                  else {
                    Model.Setting.create({
                      insights_time: '15 minutes',
                      insights_to: 'All attendees'    
                    }).then(function (setting) {
                          req.user.setSetting(setting).then(function (){
                            cb(null, setting)
                          })
                      })
                  }
              })
          }, function (setting, cb) {
              res.render('fingertips', {
                version: 'fingertips',
                layout: 'settings.handlebars',
                time: setting.insights_time,
                attendees: setting.insights_to
              });
          }
      ], function (err, result) {
          if (err) {
              req.flash('setting_error', err.error);
          }
          res.redirect('/settings');
      })
  }
});


router.post('/settings', function(req, res) {  

  let settings_param = req.body;   
  console.log('=======================settings param===================');
  console.log(settings_param);  
  let selected_times = settings_param.time;
  let selected_attendees = settings_param.attendees;

  if (!req.user) {
    return res.redirect('/signin')
  } else {
      Async.waterfall([
        function ( cb ) {   
            req.user.getSetting().then(function (setting) {
                if (setting) {
                    cb(null, setting)
                }
                else {
                  Model.Setting.create({
                    insights_time: selected_times,
                    insights_to: selected_attendees    
                  }).then(function (setting) {
                        req.user.setSetting(setting).then(function (){
                          cb(null, setting)
                        })
                    })
                }
            })
        }, function (setting, cb) {
            setting.updateAttributes({
              insights_time: selected_times,
              insights_to: selected_attendees    
            }).then(function (setting) {
              res.render('fingertips', {
              version: 'fingertips',
              layout: 'settings.handlebars',
              time: setting.insights_time,
              attendees: setting.insights_to
            });
          });            
        }
    ], function (err, result) {
        if (err) {
            req.flash('setting_error', err.error);
        }
        res.redirect('/settings');
    })
  }
  
         
});


router.get('/profile', function(req, res, next) {
  res.render('profile', { title: 'Manage Profile', layout: false });
});

router.post('/profile', function(req, res) {
  
  // validation of profile form

  let newUser = req.body;   
  let new_password = newUser.password;
  let new_confirm_password = req.body.confirm_password;
  let new_email = req.body.email;
  let new_company_name = req.body.company_name;
  let new_username = req.body.username;
  let new_company_id = req.body.company_id;

  if (new_password != new_confirm_password) {
      console.log('Not matched');
      res.render('profile', {errorMessage: { password_match:'Password is not matched. Try again'}, layout: false} );
  }

  else {

    if (!req.user) {
      return res.redirect('/signin')
    } else {
        Async.waterfall([
          function ( cb ) {   
              req.user.getUser().then(function (user) {
                  if (user) {
                      cb(null, user)
                  }
                  else {
                    Model.User.create({
                      username: new_username,
                      email: new_email,
                      company_name: new_company_name,
                      company_id: new_company_id,
                      password: new_password
                    }).then(function (user) {
                          req.user.setUser(user).then(function (){
                            cb(null, user)
                          })
                      })
                  }
              })
          }, function (user, cb) {
              user.updateAttributes({
                username: new_username,
                email: new_email,
                company_name: new_company_name,
                company_id: new_company_id,
                password: new_password    
              }).then(function (user) {
                res.render('fingertips', {
                version: 'fingertips',
                layout: 'profile.handlebars'
              });
            });            
          }
      ], function (err, result) {
          if (err) {
              req.flash('profile_error', err.error);
          }
          res.redirect('/profile');
      })
    }
  }       
});

module.exports = router