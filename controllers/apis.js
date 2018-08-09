'use strict';
const Async = require('Async');
const graph = require('fbgraph');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const moment = require("moment");

exports.getFacebook = (req, res, next) => {
    Async.waterfall([
        function (cb) {
            if (req.user)
                req.user.getFacebook().then(function (fUser) {
                    if (fUser)
                        cb(null, fUser);
                    else cb({error: 'facebook token is required'});
                });
            else cb({error: 'login required'});
        }, function (fUser, cb) {
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
        }
    ], function (err, data) {
        if (err) {
            if ('facebook' in err.error) {
                res.redirect('/auth/facebook');
            }
            else {
                res.redirect('/signin');
            }
        }
    });
};

exports.getGoogle = (req, res, next) => {
    Async.waterfall([
        function (cb) {
            if (req.user)
                req.user.getGoogle().then(function (gUser) {
                    if (gUser)
                        cb(null, gUser);
                    else cb({error: 'google token is required'});
                });
            else cb({error: 'login required'});
        }, function (gUser, cb) {
            const oauth2Client = new OAuth2(
                auth.googleAuth.clientID,
                auth.googleAuth.clientSecret,
                auth.googleAuth.callbackURL
            );

        }

    ], function (err, data) {
        if (err) {
            if ('google' in err.error) {
                res.redirect('/auth/google');
            }
            else {
                res.redirect('/signin');
            }
        }
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