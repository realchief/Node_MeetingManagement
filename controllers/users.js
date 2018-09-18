let Model = require('../models');
let Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

var _ = require('lodash');

var users = {

  getLinkedAccountsFromId : function( userId, cb ) {

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

          facebookAccount : function( cb ) {

            user.getFacebook().then(function ( fAccount ) {
              if ( fAccount) {
                 //console.log( emoji.get("smile"), 'Facebook User>>>', fAccount.id)
              }

              cb( null, fAccount )

            })

          },

          googleAccount : function ( cb ) {

            user.getGoogle().then(function (gAccount) {
              if (gAccount) {
                  //console.log( emoji.get("smile"), 'Google User>>>', "id", gAccount.id )
              }

              cb( null, gAccount )

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


  getMetricsFromLinkedAccounts: function( credentials, cb ) {

    var facebookMetrics = require('../controllers/facebook-metrics')
    var googleAnalyticsMetrics = require('../controllers/google-analytics-metrics')

     Async.parallel({

            google_analytics: ( cb ) => {

                googleAnalyticsMetrics.process(credentials.facebookAccount, function( err, results ) {

                    cb ( null, results )

                })

            },

            facebook: ( cb ) => {

                facebookMetrics.process(credentials.facebookAccount, function( err, results ) {
                   
                    cb ( null, results )

                })


            }


        }, function( err, results ) {

          // console.log( emoji.get("moneybag"), 'Google Analytics>>>', results.google_analytics.dataSource.metric_assets )
          // console.log( emoji.get("moneybag"), 'Facebook>>>', results.facebook.dataSource.metric_assets )
           
           cb ( err, results )

        })

  },

  getInsightsFromMetrics: function( metrics, cb ) {

   
    var platform = require('../controllers/platform')
    var insights = require('../controllers/insights')

    var dataSourcesMetrics = {}
    var dataSourcesList = []
    _.forEach ( metrics, function( dataSource, index ) {
        dataSourcesMetrics[index] = dataSource.dataSource;
        dataSourcesList.push(index)
    })

    // now that we have the data sources set, move each to platform
    var platformData = platform.setPlatform( dataSourcesMetrics )

    // now that we have platform, get insights.
    var allInsights = insights.getInsights( platformData, dataSourcesMetrics )

    
    var results = {
       platforms : platformData,
       insights: allInsights,
       dataSourcesList: dataSourcesList
    }

    cb ( null, results )

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