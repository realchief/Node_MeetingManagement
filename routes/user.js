let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

const moment = require("moment-timezone");

var userInfo = require('../controllers/users')

router.get('/google/setprofile', function (req, res) {   
    
    if (req.user) {
        if (req.query.view_id && req.query.account_name && req.query.property_id) {
            req.user.getGoogle().then(function (gAccount) {
                gAccount.updateAttributes({
                    view_id: req.query.view_id,
                    account_id: req.query.account_id,
                    property_id: req.query.property_id,
                    property_name: req.query.property_name,
                    view_name: req.query.view_name,
                    property_name: req.query.property_name,
                    account_name: req.query.account_name
                }).then(function (updatedResult) {
                    res.redirect('/');
                   //console.log('========updated result======');
                    //console.log(updatedResult);

                    console.log("\n", emoji.get("moneybag"), '>>>>>> set google profile', 'property name: ', req.query.view_name, req.query.property_name, req.query.account_name )

                })
            });
        }
        else res.redirect('/');
    }
    else res.redirect('signin');
})

router.get('/facebook/setprofile', function (req, res) {
    
    if (req.user) {
    
        if (req.query.account_id && req.query.account_name && req.query.account_token) {
            req.user.getFacebook().then(function ( fAccount) {                
                fAccount.updateAttributes({
                    account_id: req.query.account_id,
                    account_name: req.query.account_name,
                    account_token: req.query.account_token
                }).then(function (updatedResult) {                        
                    
                    res.redirect('/');
                   
                    console.log("\n", emoji.get("moneybag"), '>>>>>> set facebook profile', 'account name: ', req.query.account_name )

                   // console.log('========updated result======');
                   // console.log(updatedResult);             

                })
            });
        }
        else res.redirect('/');
    }
    else res.redirect('signin');
})

router.get('/signin', function(req, res, next) {
    if (req.isAuthenticated()) {
       
        req.flash( 'info', 'You are already signed in!')

        req.session.sessionFlash = {
            type: 'info',
            message: 'You are already signed in!'
        }

        res.redirect('/');
    
    } else {
    
        res.render('signin', { title: 'Sign In', layout: false, errorMessage: req.flash('errMessage') });
   
    }
});

// Add user to database.
router.post('/signin', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash : true
}));

router.get('/signup', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('signup', { title: 'Sign Up', layout: false });
    }
});

router.post('/signup', function(req, res) {
    
    // validation of signup form

    let newUser = req.body;   
    let new_password = newUser.password;
    let new_confirm_password = req.body.confirm_password;
    let new_email = req.body.email;

    if (new_password != new_confirm_password) {
        console.log('Not matched');
        res.render('signup', {errorMessage: { password_match:'Password is not matched. Try again'}, layout: false} );
    }

    else {
        Model.User.findOne({
            where: {
                'email': new_email
            }
        }).then(function (user) {
            if (user) {
                res.render('signup', {errorMessage: { email:'Duplicated User, This email was already used. Use other email.'}, layout: false} );
            }
            else {
                Model.User.create(newUser).then(function (user) {
                   
                    req.login(user, function (err) {
                       
                        if ( ! err ) {

                           req.flash( 'info', 'Thank you for signing up for MeetBrief!')
                           res.redirect('/');
                        
                        } else {
                       
                           res.redirect('signin');
                       
                        }
                    })

                    // res.redirect('signin');

                }).catch(function (err) {
                    console.log(err);
                    res.render('signup', {errorMessage: { signout:'You can not logout', layout: false }});
                });
            }
        })
    }       
});

router.get('/signout', function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/signin');
    } else {
        req.logout();
        res.redirect('/signin');
    }
});


router.get('/getuser/:company', function (req, res) {

  var userId = req.params.company ? req.params.company : req.user.id

  if ( req.params.company == "loggedin") {

    if ( req.user ) {
       userId = req.user.id
    } else {
        req.session.redirectTo = "/getuser/loggedin"
        res.redirect('/signin');
        return
   }

  }

  userInfo.getLinkedAccountsFromId(userId, function( err, credentials ) {

    var moreInfo = {}

    moreInfo.currentUTCDate = moment.utc().format("ddd, MMMM D [at] h:mma")
    moreInfo.currentLocalMachineDate = moment().format("ddd, MMMM D [at] h:mma")
    moreInfo.momentUTCOffset = moment().utcOffset()

    moreInfo.momentTimezoneEastern = moment().tz('America/New_York').format("ddd, MMMM D [at] h:mma")
    moreInfo.momentTimezoneCentral = moment().tz('America/Chicago').format("ddd, MMMM D [at] h:mma")
    moreInfo.momentTimezoneMountain = moment().tz('America/Denver').format("ddd, MMMM D [at] h:mma")
    moreInfo.momentTimezonePacific = moment().tz('America/Los_Angeles').format("ddd, MMMM D [at] h:mma")

    moreInfo.momentUTCOffsetFromEastern = moment().tz("America/New_York").utcOffset() 
    moreInfo.momentUTCOffsetFromCentral = moment().tz("America/Chicago").utcOffset()
    moreInfo.momentUTCOffsetFromMountain = moment().tz("America/Denver").utcOffset()
    moreInfo.momentUTCOffsetFromPacific = moment().tz("America/Los_Angeles").utcOffset()

    res.render('fingertips', {
        version: 'fingertips',
        layout: 'accounts.handlebars',
        user: credentials.user,
        linkedAccounts: credentials.accounts,
        moreInfo: moreInfo
    });

  })


})


module.exports = router