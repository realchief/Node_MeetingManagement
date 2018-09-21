let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

router.get('/schedule', function (req, res, next) {
    if (req.user) {
        req.user.getMeetings().then(function (meetings) {
            console.log('==========meeting==========');
            
            res.render('schdule_jobs', {
                meetings: meetings,
                layout: false
            })
        });
    }
    else res.redirect('/signin');
});

router.get('/allschedule', function (req, res, next) {
    /*if (req.user) {*/
        
        Model.Meeting.findAll({
        
            order: [
                ['start_time', 'DESC']
            ]
        
        }).then(function (meetings) {
            
            res.render('schdule_jobs', {
                meetings: meetings,
                layout: false
            })
        
        });
   /* }
    else res.redirect('/signin');*/
});


module.exports = router