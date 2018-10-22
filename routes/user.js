const sgMail = require('@sendgrid/mail');
let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

const moment = require("moment-timezone");
// var moment = require('moment');
var userInfo = require('../controllers/users')

var utilities = require('../controllers/utilities')
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

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
        	layout: 'main', 
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
            layout: 'main', 
        });
        
    }
});

router.get('/forgot', function(req, res) {

    res.render('forgot', {
        layout: 'main'
    });

});

router.post('/forgot', function(req, res, next) {    

    Async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
           
            Model.User.findOne({
                where: {
                    'email': req.body.email
                }
            }).then(function (user) {

                if (!user) {                    
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }  
                           
                user.resetPasswordToken = token;
                user.resetPasswordExpires = moment().toDate() + 3600000; // 1 hour
        
                user.save().then(function() {
                    done(null, token, user);
                });
            });
        },
        function(token, user, done) {

            const EmailContent = require('../components/EmailContent.js');
            
            var from = "insights@meetbrief.com"
            var subject = "Password Reset for Meetbrief meeting site"

            const msg = {
                to: user.email,
                from: {
                  email : from,
                  name: "MeetBrief"
                },
                subject: subject,              
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://localhost:3001' + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
          
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            sgMail.send( msg );  
            
            res.render('forgot-mail-sent', {
                layout: 'main'
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {

    Model.User.findOne({
        where: {
            'resetPasswordToken': req.params.token            
        }
    }).then(function (user) {
        
        let current_date = moment().toDate();
        console.log(current_date)   
        let isExpired = moment(user.resetPasswordExpires).isAfter(current_date);
        console.log(isExpired)

        if (!user) {                    
            req.flash('error', 'Password reset token is invalid');
            return res.redirect('/forgot');
        }

        if (isExpired) {
            req.flash('error', 'Token is expired');
            return res.redirect('/forgot');
        }
        
        res.render('reset', {
            layout: 'main',
            user: user
        });
    });

});


router.post('/reset/:token', function(req, res) { 

    let new_changed_password = req.body.changed_password;
    let new_confirm_changed_password = req.body.confirm_changed_password;

    if (new_changed_password != new_confirm_changed_password) {
        res.render('reset', {
            errorMessage: { 
                password_match: 'Your passwords do not match. Please try again!'
            }, 
            layout: 'main'
        } );
    }
    else {
        Async.waterfall([
            function(done) {
                Model.User.findOne({
                    where: {
                        'resetPasswordToken': req.params.token            
                    }
                }).then(function (user) {      
                    
                    let current_date = moment().toDate();              
                    let isExpired = moment(user.resetPasswordExpires).isAfter(current_date);             
            
                    if (!user) {                    
                        req.flash('error', 'Password reset token is invalid');
                        return res.redirect('/forgot');
                    }
            
                    if (isExpired) {
                        req.flash('error', 'Token is expired');
                        return res.redirect('/forgot');
                    }
                    
                    user.password = req.body.changed_password;                 
    
                    user.save().then(function() {
                        done(null, user);
                    });
                });
            },
            function(user, done) {
    
                const EmailContent = require('../components/EmailContent.js');           
                
                var from = "insights@meetbrief.com"
                var subject = "Your password has been changed"
    
                const msg = {
                    to: user.email,
                    from: {
                      email : from,
                      name: "MeetBrief"
                    },
                    subject: subject,              
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
              
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                sgMail.send( msg ); 
    
                res.redirect('/signin');      
            }
        ], function(err) {
          res.redirect('/');
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
    
    if (new_password != new_confirm_password) {
     
        res.render('signup', {
            errorMessage: { 
                password_match: 'Your passwords do not match. Please try again!'
            }, 
            layout: 'main'
        } );

    }

    else {

        Model.User.findOne({
            
            where: {
                'email': new_email
            }
        
        }).then(function (user) {
            
            if (user) {
        
                res.render('signup', {
                    errorMessage: { 
                        email:'Sorry, this email address already exists.'
                    }, 
                    layout: 'main.handlebars'
                } );
        
            }
        
            else {


                Model.Company.findOne({
            
                    where: {
                        'company_name': company_name
                    }
                
                }).then( function( company ) {

                    if ( company ) {
        
                        res.render('signup', {
                            errorMessage: { 
                                company_name:'Sorry, this company name has already been used.'
                            }, 
                            layout: 'main.handlebars'
                        } );

                
                    }

                    else {

                        Model.Company.create( newUser ).then( function ( company ) {

                            return Model.User.create( newUser ).then(function ( user ) {
                          
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
                          
                                res.render('signup', {
                                    errorMessage: { 
                                        signout:' You can not sign up'
                                    }, 
                                    layout: 'main.handlebars'
                                } );

                            });

                        }).catch(function(err) {
                            // print the error details
                            console.log('Company Create Error:', err);
                        });

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

    res.render('accounts', {
        version: 'fingertips',
        layout: 'main',
        user: credentials.user,
        linkedAccounts: credentials.accounts,
        moreInfo: moreInfo
    });

  })


})


router.get('/settings',  function (req, res) {

    if (!req.user) {

        req.session.redirectTo = "/settings"
        return res.redirect('/signin')
    }
    else {          
        userInfo.getCompanySettings(req.user.company.id, function (err, setting) {            
            if (err) {
                req.flash('setting_error', err.error);
            } 
            res.render('settings', {
                layout: 'main',
                page: 'settings',
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

        res.render('profile', {
            layout: 'main',
            page: 'profile',
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
        
        res.render( 'profile', { 
            layout: 'main',
            page: 'profile',
            errorMessage: { 
                password_match:'Your passwords do not match. Please try again!'
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

    // look for an existing user
         Model.User.findOne({
            
            where: {
                [Op.or]: [{'email': updated_email}]

                //, {'user_id': updated_user_id}
            }
        
            }).then(function (user) {
                
                if ( user && ( req.user.email !== updated_email ) ) {
            
                    var errorMessage =  { 
                        email:'Sorry, ' + updated_email + ' is already in use.'
                    }
                    

                    res.render( 'profile', { 
                        layout: 'main',
                        page: 'profile',
                        errorMessage: errorMessage,
                        user: req.user
                    })
            
                }
            
                else {


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

        })
    } 

  else {
    
    req.session.redirectTo = '/profile'

    res.redirect('signin');
 }
      
});


router.get('/team',  function (req, res) {

    if (!req.user) {

        req.session.redirectTo = "/team"
        return res.redirect('/signin')
    }
    else {          

        req.user.getCompany().then( function( company ) {

            company.getUsers().then( function( members ) {
                
                res.render('team', {
                    layout: 'main',
                    page: 'team',
                    members : members,
                    user: req.user
                });

            })

        })

    }
});



router.get('/team/add',  function (req, res) {

    if (!req.user) {

        req.session.redirectTo = "/team/add"
        return res.redirect('/signin')
    }
    else {          

        res.render('add-team-member', {
            version: 'fingertips',
            layout: 'main',
            page: 'team',
            user: req.user
        });

    }
});



router.post('/team/add',  function (req, res) {

    let newTeamMember = req.body;   

    if (!req.user) {

        req.session.redirectTo = "/team/add"
        return res.redirect('/signin')
    }

    else {    


        // look for an existing user
         Model.User.findOne({
            
            where: {
                'email': newTeamMember.email
            }
        
            }).then(function (user) {
                
                if (user) {
            
                    var errorMessage =  { 
                       email:'Sorry, ' + newTeamMember.email + ' is already in use.'
                    }
                    

                    res.render('add-team-member', {
                        layout: 'main',
                        page: 'team',
                        errorMessage : errorMessage,
                        newTeamMember : newTeamMember,
                        user: req.user
                    });
            
                }
            
                else {

                Model.User.create( newTeamMember ).then(function ( member ) {
                          
                    return Model.Role.findOne({
                        
                        where : { 'role_name' : 'team_member' }

                    }).then( function( role ) {

                        if ( !role ) {
                            console.log('no role!!')
                        }

                        return member.setRole( role ).then( function() {

                            return member.setCompany( req.user.company ).then( function() {

                               req.session.sessionFlash = {
                                    type: 'info',
                                    message: 'Team Member' + ' ' + member.username + ' ' + 'has been added.'
                                }

                               res.redirect('/team');

                            })
                        })

                    })
                
                })

            }


        })


        

    }

});


router.get('/team/edit/:id',  function (req, res) {

    if (!req.user) {

        req.session.redirectTo = "/team/"
        return res.redirect('/signin')
    }

    else {          

        var whereClause = { 'id' : req.params.id }

        Model.User.findOne( { where: whereClause } ).then(function ( member ) {

            res.render('edit-team-member', {
                layout: 'main',
                page: 'team',
                teamMember : member,
                user: req.user
            });

        })

    }
});


router.post('/team/edit/',  function (req, res) {

    let memberInfo = req.body;
    memberInfo.user_id = memberInfo.email

    if (!req.user) {

        req.session.redirectTo = "/team/"
        return res.redirect('/signin')
    }

    else {          



        // look for an existing user
         Model.User.findOne({
            
            where: {
                'email': memberInfo.email
            }
        
            }).then(function (user) {
                
                if (user && ( user.email !== memberInfo.current_email) ) {
            
                    var errorMessage =  { 
                       email:'Sorry, ' + memberInfo.email + ' is already in use.'
                    }
                    
                    memberInfo.email = memberInfo.current_email

                    res.render('edit-team-member', {
                        layout: 'main',
                        page: 'team',
                        errorMessage : errorMessage,
                        teamMember : memberInfo,
                        user: req.user
                    });
            
                }
            
                else {


                    var whereClause = { 'id' : memberInfo.id }

                    Model.User.findOne( { where: whereClause } ).then(function ( member ) {

                        member.updateAttributes(memberInfo).then( function( updatedResult ){
                       
                            req.session.sessionFlash = {
                                    type: 'info',
                                   message: 'Team Member' + ' ' + member.username + ' ' + 'has been updated.'
                                }

                            res.redirect('/team/edit/' + updatedResult.id);

                          })
                     
                    })

                }

            })

    }

});

router.get('/team/delete/:id',  function (req, res) {

    if (!req.user) {

        req.session.redirectTo = "/team/"
        return res.redirect('/signin')
    }

    else {          

        var whereClause = { 'id' : req.params.id }

        Model.User.findOne( { where: whereClause } ).then(function ( member ) {

            res.render('delete-team-member', {
                layout: 'main',
                page: 'team',
                teamMember : member,
                user: req.user
            });

        })

    }
});

router.post('/team/delete/',  function (req, res) {

    let memberInfo = req.body;
  
    if (!req.user) {

        req.session.redirectTo = "/team/"
        return res.redirect('/signin')
    }

    else {          

        var whereClause = { 'id' : memberInfo.id }

        Model.User.findOne( { where: whereClause } ).then(function ( member ) {

            member.destroy( member ).then( function( updatedResult ){
           
                req.session.sessionFlash = {
                        type: 'info',
                        message: 'Team Member' + ' ' + member.username + ' ' + 'has been deleted.'
                    }

                res.redirect('/team/');

              })
         
        })

    }

});



module.exports = router