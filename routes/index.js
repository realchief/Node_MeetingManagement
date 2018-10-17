let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

var userInfo = require('../controllers/users')

var colors = require('colors');
var emoji = require('node-emoji')

var _ = require('lodash');

router.get('/',  function (req, res) {

    var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
    
    if ( redirectTo !== "/") {

        if ( res.locals.sessionFlash ) {
            req.session.sessionFlash = res.locals.sessionFlash
        } 
        
        delete req.session.redirectTo;
        res.redirect(redirectTo);
        return
    }

    if (req.user) {

        //console.log('\n', emoji.get("smile"), '***** Results: ', results);
        console.log('\n', emoji.get("smile"), '***** User: ', req.user.username, req.user.email, req.user.company.company_name);

        res.render('fingertips', {
            layout: 'main',
            page: 'home',
            user : req.user,
        });

    }

    else res.redirect('/signin');
});



router.get('/data-sources',  function (req, res) {

    var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/data-sources';
    
    if ( redirectTo !== "/data-sources") {

        if ( res.locals.sessionFlash ) {
            req.session.sessionFlash = res.locals.sessionFlash
        } 
        
        delete req.session.redirectTo;
        res.redirect(redirectTo);
        return
    }

    if (req.user) {

        var utilities = require('../controllers/utilities')
        var connectionsList = require('../definitions/connections').get()
        var connectionsOrder = connectionsList.map(a => a.name);
     
        userInfo.getSummaries(req.user.user_id, function ( err, summaries ) {
            
            if (err) {
                console.log('***** Error: ', err);
                return;
            }

            _.forEach( summaries.accounts, function( account_info, account_name ){

                var connectionIndex = connectionsOrder.indexOf(account_name)
                var connection = connectionsList[connectionIndex]

                var propertyList = account_info.account_list
                var chosen_account = account_info.chosen_account;

                if ( chosen_account ) {
                    connection.status = "connected",
                    connection.buttonText = "Edit Connection"
                    connection.buttonLink = "/auth/" + connection.linkLabel + "/unlink/"

                    connection.account_email = chosen_account.email

                    // need property display name
                    connection.account_property = chosen_account.account_name

                }

                if ( propertyList ) {
                    connection.status = "property"
                    connection.buttonText = "Edit Connection"
                    connection.buttonLink = "/auth/" + connection.linkLabel + "/unlink/"
                }

            })

            console.log(summaries.accounts)

            //console.log('\n', emoji.get("smile"), '***** Results: ', results);
            //console.log('\n', emoji.get("smile"), '***** User: ', req.user.username, req.user.email, req.user.company.company_name);

            res.render('data-sources', {
                layout: 'main',
                page: 'data-sources',
                user : req.user,
                summaries : summaries.accounts,
                numConnections: summaries.numberOfConnectedAccounts,
                numAccountLists: summaries.numberOfAccountLists,
                connectionsList: connectionsList
            });

        });
    }
    else res.redirect('/signin');
});

module.exports = router