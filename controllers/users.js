let Model = require('../models');
let Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

var users = {

  getConnectedAccountsFromId : function( userId, cb ) {

      let company = userId
      
      let type = ( isNaN(Number(company)) ) ? 'company_id' : 'id'

      let whereClause = ( type == "company_id" ) ? { 'company_id' : company } : { 'id' : company }

      Model.User.findOne({
         
          where: whereClause
      
      }).then( function ( user ) {
      
          if (!user) {
              console.log('>>> Cant Find user', user)
              var results = "No User Found"
              cb( null, results )
              return
          }
        
        Async.parallel({

          facebookUser : function( cb ) {

            user.getFacebook().then(function ( fUser ) {
              if ( fUser) {
                 //console.log( emoji.get("smile"), 'Facebook User>>>', fUser.id)
              }

              cb( null, fUser )

            })

          },

          googleUser : function ( cb ) {

            user.getGoogle().then(function (gUser) {
              if (gUser) {
                  //console.log( emoji.get("smile"), 'Google User>>>', "id", gUser.id )
              }

              cb( null, gUser )

            })

          }
        }, function ( err, results ) {

            results.user = user
            results.company = company
           // console.log( emoji.get("smile"), 'User from id results>>>', err, results )
            cb( err, results )
           
        })

    })

  },

  getSummaries : function( user, cb ) {


    Async.parallel({
            
          google_summaries: function ( cb ) {
              googleApi.getAccountListOrSelectView( user, function (err, data) {
                  cb(null, data);
              })
          },
          
          facebook_summaries: function ( cb ) {
              facebookApi.getAccountListOrSelectView( user, function (err, data) {
                  cb(null, data);
              })
          }
      }, function (err, results) {

        cb ( null, results )

      })

  }

}


module.exports = users