'use strict';
const Async = require('async');
const graph = require('fbgraph');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const moment = require("moment");
const auth = require('../config/auth');

let oauth2Client = new OAuth2(
    auth.googleAuth.clientID,
    auth.googleAuth.clientSecret,
    auth.googleAuth.callbackURL
);

exports.getFacebook = (fUser, cb) => {
        const token = fUser.token;
        graph.setAccessToken(token);
        Async.parallel({
                getMyProfile: (done) => {
                    graph.get(`${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err, me) => {
                        done(err, me);
                    });
                },
                getMyFriends: (done) => {
                    graph.get(`${req.user.facebook}/friends`, (err, friends) => {
                        done(err, friends.data);
                    });
                }
            },
            (err, data) => {
                cb(null, data);
            });
};

exports.getGoogleMatrics = (gUser, cb) => {

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
            google.analytics('v3').management.accountSummaries.list(function (response) {
                done(null, response);
            });
        },
        gaColumns: function (done) {
            google.analytics('v3').metadata.columns.list({ 'reportType' : 'ga'}, function (response) {
                let gaColumns = {};
                for (var i = 0;i < response.result.items.length;i ++) {
                    let column = response.result.items[i];
                    gaColumns[column.id] = column.attributes;
                }
                done(null, gaColumns);
            });
        }
    }, function (err, data) {
        cb(null, data)
    });
    
    
};

exports.checkGoogleToken =  (req, res, next) => {
    // check for user
    if (!req.user) {
      return next();
    }
    req.user.getGoogle().then(function (gUser) {
        if (gUser && moment().subtract(gUser.expiry_date, "s").format("X") > -300) {
            oauth2Client.setCredentials({
                access_token: gUser.token,
                refresh_token: gUser.refresh_token
            });
            oauth2Client.refreshAccessToken(function (err, tokens) {
                gUser.updateAttributes({
                    token: tokens.access_token,
                    refresh_token: tokens.id_token,
                    expiry_date: moment().add(tokens.expires_in, "s").format("X")
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
        if (fUser && moment().subtract(gUser.expiry_date, "s").format("X") > -86400) {
            graph.extendAccessToken({
                "access_token":     fUser.token,
                "client_id":      auth.facebookAuth.ClientId,
                "client_secret":  conf.facebookAuth.clientSecret
            }, function (err, facebookRes) {
                fUser.updateAttributes({
                    token: facebookRes.token
                }).then(function (result) {
                    next();
                });
            });
        }
    });
};