let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');
var _ = require('lodash');

var colors = require('colors');
var emoji = require('node-emoji')

router.get('/schedule', function (req, res, next) {
    
    if (req.user) {
    
        req.user.getMeetings().then(function (meetings) {
            console.log('==========meeting==========');
            
           res.render('fingertips', {
               meetings: meetings,
              layout: 'schedule.handlebars',
              user: req.user
            })

        });
    
    }
    
    else {
        req.session.redirectTo = "schedule"
        res.redirect('/signin');
    }
});


router.get('/schedule-company', function (req, res, next) {
    
    if (req.user) {
    
        req.user.company.getUsers({attributes: ['id']}).then( function( members ){

            var memberIds = []
            _.forEach( members, function(member, index){
                memberIds.push(member.id)
            })
            
            var whereClause = { 'UserId' : memberIds }
            Model.Meeting.findAll( { where : whereClause }).then( function( meetings ) {
            
                res.render('fingertips', {
                    meetings: meetings,
                    layout: 'schedule.handlebars',
                    user: req.user
                })

            })

        })


    
    }
    
    else {
        req.session.redirectTo = "/schedule-company"
        res.redirect('/signin');
    }
});


router.get('/allschedule', function (req, res, next) {
    /*if (req.user) {*/
        
        Model.Meeting.findAll({
        
            order: [
                ['start_time', 'DESC']
            ]
        
        }).then(function (meetings) {
            
            res.render('fingertips', {
                    meetings: meetings,
                    layout: 'schedule.handlebars'
                })
        
        });
   /* }
    else res.redirect('/signin');*/
});


module.exports = router