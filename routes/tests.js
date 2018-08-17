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

                      google.analytics('v3').management.accountSummaries.list(function (err, response) {

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


                  }                    
              },
              
              (err, result) => {

                  let output = JSON.stringify(result.getFacebookData)
                  output += JSON.stringify(result.getGoogleData.data) 

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



router.get('/testsocial-loggedin', function (req, res) {

  const Async = require('async');
  const graph = require('fbgraph');
 //const token = fUser.token
 
      if (req.user) {

        console.log(req.user)

        const token = "EAAH7jVaPTKQBALeANgzauPUKKrqJcH1jcNPBPEz9WtLa6G6ZAAAuZAHbQmMWVQvOfqBtfP8u5nLTH9Ou9MihZAH3ZCxmZCiJDxfZABC2zkchiuxHK1Yns5fqnqfV6ejDxpwlPA7miAMieJ9gf5PJclck26fZA90JdEZD";

        graph.setAccessToken(token);
        Async.parallel({
                getMyProfile: (done) => {
                    graph.get("me/?fields=name,first_name,middle_name,last_name,email,accounts{name,global_brand_page_name,id,access_token,link,username}", (err, me) => {
                          console.log('get facebook data - me', me)

                        done(err, me);
                    });
                },
                getMyFriends: (done) => {
                    graph.get("me/friends", (err, friends) => {
                          console.log('get facebook data - friends', friends)

                        done(err, friends.data);
                    });
                }
            },
            (err, data) => {

               console.log('returned data>>>>', data)

                res.render('fingertips', {
                    layout: 'social-test.handlebars',
                    user : req.user,
                    data: JSON.stringify(data),
                });

            });

    } else {

      req.session.redirectTo = '/testsocial-loggedin';
      res.redirect('/signin');
    }

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

module.exports = router