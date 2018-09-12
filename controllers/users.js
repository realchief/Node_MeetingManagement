let Model = require('../models');
let Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

var users = {

  getConnectedAccountsFromId : function(userId, callback) {

      let company = userId
      
      let type = ( isNaN(Number(company)) ) ? 'company_id' : 'id'

      let whereClause = ( type == "company_id" ) ? { 'company_id' : company } : { 'id' : company }

      Model.User.findOne({
         
          where: whereClause
      
      }).then( function ( user ) {
      
          if (!user) {
              console.log('>>> Cant Find user', user)
              var results = "No User Found"
              callback(null, results)
              return
          }
        
        Async.parallel({

          facebookUser : function( done ) {

            user.getFacebook().then(function (fUser) {
              if (fUser) {
                  console.log( emoji.get("smile"), 'Facebook User>>>', fUser.id)
              }

              done( null, fUser )

            })

          },

          googleUser : function ( done ) {

            user.getGoogle().then(function (gUser) {
              if (gUser) {
                  console.log( emoji.get("smile"), 'Google User>>>', "id", gUser.id )
              }

              done( null, gUser )

            })

          }
        }, function ( err, results ) {

            results.user = user
            results.company = company
            //console.log( emoji.get("smile"), 'User from id results>>>', results )
            callback(err, results)
           
        })

    })

  }

}


module.exports = users