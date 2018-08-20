'use strict';
const Async = require('async');
const graph = require('fbgraph');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const moment = require("moment");
const auth = require('../config/auth');
const sgMail = require('@sendgrid/mail');
const schedule = require('node-schedule');

let oauth2Client = new OAuth2(
    auth.googleAuth.clientID,
    auth.googleAuth.clientSecret,
    auth.googleAuth.callbackURL
);

exports.getFacebookMetrics = (fUser, cb) => {
        const token = fUser.token
        graph.setAccessToken(token);
        Async.parallel({
                getMyProfile: (done) => {
                    graph.get(`${fUser.profile_id}?fields=name,first_name,middle_name,last_name,email,accounts{name,global_brand_page_name,id,access_token,link,username}`, (err, me) => {
                       //   console.log('get facebook data - me', me)

                        done(err, me);
                    });
                },
                getMyFriends: (done) => {
                    graph.get(`${fUser.profile_id}/friends`, (err, friends) => {
                        //  console.log('get facebook data - friends', friends)

                        done(err, friends.data);
                    });
                }
            },
            (err, data) => {
                cb(null, data);
            });
};

exports.getGoogleMetrics = (gUser, cb) => {

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
    Async.parallel({
        users: function (done) {

            google.analytics('v3').management.accountSummaries.list(function (err, response) {

                if (err) {
                  console.log('Google API error:', err);
                  return;
                }

              // console.log('get google data - account all', response.data)
            
                if (response && !response.error) {
                  // console.log('get google data - account summary', response.data)
                    done(null, response);
                } else {
                  // console.log('get google data - account summary error', response.data)
                    done(null, response);
                }
            });
        },
        gaColumns: function (done) {
            google.analytics('v3').metadata.columns.list({ 'reportType' : 'ga'}, function (err, response) {
                
                //console.log('get google data - columns all', response.data)

                if (err) {
                  console.log('Google API error:', err);
                  return;
                }

                let gaColumns = {};

                if ( typeof response.items !== 'undefined') {

                    for (var i = 0;i < response.items.length;i ++) {
                        let column = response.result.items[i];
                        gaColumns[column.id] = column.attributes;
                    }


                }
                done(null, response.data);
            });
        }
    }, function (err, data) {
        cb(null, data)
    });
    
    
};

exports.checkGoogleToken =  (req, res, next) => {

    console.log('checking google token')

    // check for user
    if (!req.user) {
      return next();
    }
    req.user.getGoogle().then(function (gUser) {

        if ( gUser ) {
            console.log('>>>>>> google refresh token:', gUser.refresh_token, 'seconds before expiry', moment().subtract(gUser.expiry_date, "s").format("X"))
        }

        if (gUser && moment().subtract(gUser.expiry_date, "s").format("X") > -300) {
            // subtract current time from stored expiry_date and see if less than 5 minutes (300s) remain
            console.log('we passed the expiry_date and trying to update google access token')

            oauth2Client.setCredentials({
                access_token: gUser.token,
                refresh_token: gUser.refresh_token
            });

            oauth2Client.refreshAccessToken(function (err, tokens) {

                if (err) {
                    console.log('Refresh Token Error>>>', err)
                    return next(err);
                }

                console.log('trying to update google access token', tokens)

                // google returns timestamp with milliseconds, so fix that //
                var expiry_date = parseInt(tokens.expiry_date / 1000)

                gUser.updateAttributes({
                    token: tokens.access_token,
                    expiry_date: expiry_date
                }).then(function (result) {
                    console.log('token updated!');
                    next();
                });
            });
        }
        else next();
    });
  };

exports.checkFacebookToken = (req, res, next) => {
    if (!req.user) {
        return next();
    }
    req.user.getFacebook().then(function (fUser) {

        if ( fUser ) {
            console.log('>>>>>> facebook refresh token:', fUser.token, 'seconds since refresh', moment().subtract(fUser.expiry_date, "s").format("X"))
        }

        if (fUser && moment().subtract(fUser.expiry_date, "s").format("X") > 86400) {

            graph.extendAccessToken({
                "access_token":   fUser.token,
                "client_id":      auth.facebookAuth.clientID,
                "client_secret":  auth.facebookAuth.clientSecret
            }, function (err, facebookRes) {
                
                 console.log('extend facebook access token', facebookRes)

                fUser.updateAttributes({
                    token: facebookRes.token,
                    expiry_date: moment().format('X')
                }).then(function (result) {
                    next();
                });
            });
        }
        else return next();
    });
};