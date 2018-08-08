'use strict';
const Async = require('Async');
const graph = require('fbgraph');
const {google} = require('googleapis');

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
        },

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