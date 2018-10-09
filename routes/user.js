let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

const moment = require("moment-timezone");
var userInfo = require('../controllers/users')

var utilities = require('../controllers/utilities')

router.get('/google/setprofile', function (req, res) {   
    
    if (req.user) {
       
        if (req.query.view_id && req.query.account_name && req.query.property_id) {
            
            req.user.getCompany().then( function( company ) {

                company.getGoogle().then(function (gAccount) {
                
                    gAccount.updateAttributes({
                      
                        view_id: req.query.view_id,
                        account_id: req.query.account_id,
                        property_id: req.query.property_id,
                        property_name: req.query.property_name,
                        view_name: req.query.view_name,
                        property_name: req.query.property_name,
                        account_name: req.query.account_name
                    
                    }).then(function (updatedResult) {
                        
                        req.session.sessionFlash = {
                            type: 'info',
                            message: 'Your Google Analytics View has been set to ' + 'Account: ' + updatedResult.account_name + ' : ' + updatedResult.property_name + ' - ' + updatedResult.view_name
                        }

                        res.redirect('/data-sources');
                    
                        console.log("\n", emoji.get("moneybag"), '>>>>>> set google profile', 'property name: ', req.query.view_name, req.query.property_name, req.query.account_name )

                    })
                });

            })
        
        } else {

            req.session.sessionFlash = {
                type: 'info',
                message: 'No user information provided to set Google Analytics View.'
            }

            res.redirect('/');
        }

    } else {

        res.redirect('signin');

    }

})

router.get('/facebook/setprofile', function (req, res) {
    
    if (req.user) {
    
        if (req.query.account_id && req.query.account_name && req.query.account_token) {
            
            req.user.getCompany().then( function( company ) {

                company.getFacebook().then(function ( fAccount) {                
                    fAccount.updateAttributes({

                        account_id: req.query.account_id,
                        account_name: req.query.account_name,
                        account_token: req.query.account_token
                    
                    }).then(function (updatedResult) {                        
                        
                        req.session.sessionFlash = {
                            type: 'info',
                            message: 'Your Facebook Page has been set to ' + updatedResult.account_name
                        }

                        res.redirect('/data-sources');
                       
                        console.log("\n", emoji.get("moneybag"), '>>>>>> set facebook profile', 'account name: ', req.query.account_name )

                       // console.log('========updated result======');
                       // console.log(updatedResult);             

                    })
                });
            })

        } else {

            req.session.sessionFlash = {
                type: 'info',
                message: 'No user information provided to set Facebook Account.'
            }
            
            res.redirect('/');

        } 
    
    } else {
     
        res.redirect('signin');
    
    }
})

router.get('/signin', function(req, res, next) {
   
    if (req.isAuthenticated()) {
       
        req.flash( 'info', 'You are already signed in!')

        req.session.sessionFlash = {
            type: 'info',
            message: 'You are already signed in!'
        }

        req.session.redirectTo = "/data-sources"
        res.redirect('/');
    
    } else {
    
        res.render('signin', { 
        	title: 'Sign In', 
        	layout: false, 
        	errorMessage: req.flash('errMessage') 
        });
   
    }
});

// Add user to database.
router.post('/signin', passport.authenticate('local', {

    successRedirect: '/data-sources',
    failureRedirect: '/signin',
    failureFlash : true

}));

router.get('/signup', function(req, res, next) {

    if (req.isAuthenticated()) {
        
        req.session.sessionFlash = {
            type: 'info',
            message: 'You are already signed in!'
        }

        res.redirect('/data-sources');
    

    } else {
        
        res.render('signup', { 
        	title: 'Sign Up', 
        	layout: false 
        });
        
    }
});

router.post('/signup', function(req, res) {
    
    // validation of signup form

    let newUser = req.body;   
    let new_password = req.body.password;
    let new_confirm_password = req.body.confirm_password;
    
    let new_email = req.body.email;
    let company_name = req.body.company_name;
    newUser.creator_email = req.body.email;
    
    let new_user_id = new_email.replace(/.*@/, "").split('.')[0].toLowerCase();
     
    if (new_password != new_confirm_password) {
     
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


                Model.Company.findOne({
            
                    where: {
                        'company_name': company_name
                    }
                
                }).then( function( company ) {

                    if (user) {
        
                        res.render('signup', {errorMessage: { email:'Company Name has already been used.'}, layout: false} );
                
                    }

                    else {

                        Model.Company.create( newUser ).then( function ( company ) {

                            Model.User.create( newUser ).then(function ( user ) {
                          
                                return Model.Role.findOne({
                                    
                                    where : { 'role_name' : 'admin' }

                                }).then( function( role ) {

                                    if ( !role ) {
                                        console.log('no role!!')
                                    }

                                    return user.setRole( role ).then( function() {

                                        return user.setCompany( company ).then( function() {

                                             req.login( user, function (err) {
                                       
                                                if ( ! err ) {

                                                   req.flash( 'info', 'Thank you for signing up for MeetBrief!')

                                                   req.session.sessionFlash = {
                                                        type: 'info',
                                                        message: 'Thank you for signing up for Meetbrief! Choose your first source of information to get started.'
                                                    }

                                                   res.redirect('/data-sources');
                                                
                                                } else {
                                               
                                                   res.redirect('signin');
                                               
                                                }
                                            })

                                        })


                                    })


                                })

                                

                                // res.redirect('signin');

                            }).catch(function (err) {
                                console.log(err);
                                res.render('signup', {errorMessage: { signout:'You can not sign up', layout: false }});
                            });

                        })

                    }
            
                })

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


router.get('/getuser/:user_id', function (req, res) {

  var userId = req.params.user_id ? req.params.user_id : req.user.id

  if ( req.params.user_id == "loggedin") {

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


router.get('/settings',  function (req, res) {

    if (!req.user) {
        return res.redirect('/signin')
    }
    else {          
        userInfo.getCompanySettings(req.user.company.id, function (err, setting) {            
            if (err) {
                req.flash('setting_error', err.error);
            } 
            res.render('fingertips', {
                version: 'fingertips',
                layout: 'settings.handlebars',
                time: setting.insights_time,
                attendees: setting.insights_to,
                user:req.user
            });
        });
    }
});


router.post('/settings', function(req, res) {  
  
    let settings_param = req.body;   
    //console.log('=======================settings param===================');
    //console.log(settings_param);  
    let selected_times = settings_param.time;
    let selected_attendees = settings_param.attendees;
  
    if (!req.user) {
      
      return res.redirect('/signin')
    
    } else {
    
        userInfo.getCompanySettings(req.user.company.id, function (err, setting) {

            if (err) {
                req.flash('setting_error', err.error);
            }

            setting.updateAttributes({

                insights_time: selected_times,
                insights_to: selected_attendees    

            }).then(function (setting) {              

                req.session.sessionFlash = {
                    type: 'info',
                    message: 'Settings have been updated.'
                }

                //console.log('==========Setting=======');
                //console.log(setting);
                res.redirect('/settings');

            });            
        });

    }

}); 

router.get('/profile', function(req, res, next) {

    let updatedUser = req.body;   
    let updated_email = updatedUser.email;
    let updated_company_name = updatedUser.company_name;
    let updated_username = updatedUser.username;
    let updated_user_id = updatedUser.user_id;

    if (!req.user) {

        req.session.sessionFlash = {
            type: 'info',
            message: 'Please sign in first.'
        }
        
        req.session.redirectTo = "/profile"
        res.redirect('/signin')
        return

    } else {        

        res.render('fingertips', {
            layout: 'profile.handlebars',
            user : req.user                     
        });

    }
});

  router.post('/profile', function(req, res) {  
  
    let updatedUser = req.body;   

    let updated_username = updatedUser.username;
    let updated_email = updatedUser.email;
    let updated_company_name = updatedUser.company_name;
    let updated_user_id = updatedUser.user_id;
    let updated_email_domain = updatedUser.email_domain;

    let updated_password = updatedUser.password;
    let updated_confirm_password = updatedUser.confirm_password;

    var toUpdate = {}
    var companyToUpdate = {}

    if (updated_password != updated_confirm_password) {
        
        res.render( 'fingertips', { 
            layout: 'profile.handlebars',
            errorMessage: { 
                password_match:'Password is not matched. Try again'
            },
            user: req.user
        })

        return
    }

    toUpdate.username = updated_username;
    toUpdate.email = updated_email;
    toUpdate.user_id = updated_user_id;
    toUpdate.email_domain = updated_email_domain;

    if ( updated_password !== "" ) {
        toUpdate.password = updated_password
    }

    companyToUpdate.company_name = updated_company_name;
    companyToUpdate.whitelisted_domains = updated_email_domain.split(',');
    companyToUpdate.creator_email = updated_email;

      
  if (req.user) { 

      req.user.getCompany().then( function( company ){

        company.updateAttributes(companyToUpdate).then( function( updatedResult ){

             req.user.updateAttributes(toUpdate).then(function (updatedResult) {   

                req.session.sessionFlash = {
                        type: 'info',
                        message: 'Profile has been updated.'
                    }

                res.redirect('/profile');
              })

        })

    })

    } 

  else {
    
    req.session.sessionFlash = {
        type: 'info',
        message: 'Something happened wrong from profile settings.'
    }

    res.redirect('signin');
 }
      
});


module.exports = router