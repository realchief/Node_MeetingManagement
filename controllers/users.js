let Model = require('../models');
let Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

let facebookApi = require('../controllers/facebook-api');
let googleApi = require('../controllers/google-analytics-api');

var _ = require('lodash');

var users = {

  getLinkedAccountsFromId : function( userId, cb ) {

      let company = userId
      
      let type = ( isNaN(Number(company)) ) ? 'user_id' : 'id'

      let whereClause = ( type == "user_id" ) ? { 'user_id' : company } : { 'id' : company }

      Model.User.findOne({
         
          where: whereClause
      
      }).then( function ( user ) {
      
          if (!user) {
              
              console.log('>>> Cant Find user', user)
              var credentials = {}
              var user = {}
              credentials.accounts = Object.assign({}, null)
              user.username = 'Dennis Nedry'
              user.user_id = 'jurassicpark'
              credentials.user = user
              cb( null, credentials )
              return
          
          }

          user.getCompany().then( function( company ) {

            if (!company) {
              
              console.log('>>> Cant Find company', company)
              var credentials = {}
              credentials.accounts = Object.assign({}, null)
              credentials.user = user
              credentials.user.user_id = 'fluxcapacitor',
              credentials.user.company_name = 'Hill Valley',
              cb( null, credentials )
              return
          
            }

            console.log( emoji.get("smile"), 'Linked Accounts Found>>>', 'user id', user.user_id, 'tied to company:', company.company_name )

             Async.parallel({

                  google_analytics : function ( cb ) {

                    company.getGoogle().then(function (gAccount) {
                      
                      if (gAccount) {
                          //console.log( emoji.get("smile"), 'Google User>>>', "id", gAccount.id )
                      }

                      cb( null, gAccount )

                    })

                  },

                  facebook : function( cb ) {

                    company.getFacebook().then(function ( fAccount ) {
                      
                      if ( fAccount) {
                         //console.log( emoji.get("smile"), 'Facebook User>>>', fAccount.id)
                      }

                      cb( null, fAccount )

                    })

                  },

                }, function ( err, credentials ) {

                    credentials.accounts = Object.assign({}, credentials)
                    credentials.user = user
                    credentials.user.company = company
                    credentials.company = company

                   // console.log( emoji.get("smile"), 'User from id results>>>', err, results )
                    cb( err, credentials )
                   
                })

            })

      })

  },


  getMetricsFromLinkedAccounts: function( credentials, cb ) {

    var linkedAccounts = {}

    _.forEach( credentials.accounts, function ( account, accountName ) {

      if ( !account ) { 
        
        console.log("\n", emoji.get('warning'), 'No account info for', accountName )
      
      } else {
        
        linkedAccounts[accountName] = ( cb ) => {

            var metrics = require('../controllers/' + accountName.replace('_', '-') + '-metrics')
            metrics.process(credentials.accounts[accountName], function( err, results ) {

                if ( err ) {
                   
                   errorMessage = { message: accountName + ' ' + 'metrics process error from getMetricsFromLinkedAccounts' }
                   cb( errorMessage )

                } else {
                   
                   cb ( null, results )
                
                }

            })

        }

      }

    })

    Async.parallel(linkedAccounts, function( err, results ) {

        // console.log( emoji.get("moneybag"), 'Google Analytics>>>', results.google_analytics.dataSource.metric_assets )
        // console.log( emoji.get("moneybag"), 'Facebook>>>', results.facebook.dataSource.metric_assets )
         
         cb ( err, results )

      })

  },

  getInsightsFromMetrics: function( metrics, cb ) {

    var platform = require('../controllers/platform')
    var insights = require('../controllers/insights')

    var dataSourcesFields = {}
    var dataSourcesList = []
    _.forEach ( metrics, function( dataSource, index ) {
        dataSourcesFields[index] = dataSource.dataSource;
        dataSourcesList.push(index)
    })

    // now that we have the data sources set, move each to platform
    var platformData = platform.setPlatform( dataSourcesFields )

    // now that we have platform, get insights.

    insights.getInsights( platformData, dataSourcesFields ).then( function( insights ){

         var results = {
           platforms : platformData,
           insights: insights,
           dataSourcesList: dataSourcesList
        }

        cb ( null, results )

    })
    
   

  },

  getSummaries : function( userId, cb ) {

    var thisModule = this
    var numberOfConnectedAccounts = 0;
    var numberOfAccountLists = 0;

    thisModule.getLinkedAccountsFromId(userId, function( err, credentials ) {

      var linkedAccounts = {}

      _.forEach( credentials.accounts, function ( account, accountName ) {

        if ( !account ) { 
          
          console.log("\n", emoji.get('warning'), 'No connected account for', accountName )
        
        } else {
          
          linkedAccounts[accountName] = ( cb ) => {

              var api = require('../controllers/' + accountName.replace('_', '-') + '-api')
              api.getAccountListOrSelectView(credentials.company, function( err, results ) {
                   if ( results.chosen_account ) { numberOfConnectedAccounts++ }
                   if ( results.account_list ) { numberOfAccountLists++ }
                   cb ( null, results )
              })

          }

        }

      })

      Async.parallel(linkedAccounts, function ( err, summaries ) {

        summaries.accounts = Object.assign({}, summaries)
        summaries.numberOfConnectedAccounts = numberOfConnectedAccounts
        summaries.numberOfAccountLists = numberOfAccountLists
        cb ( null, summaries )

      })

    })
   
  },

  getInsightsFromId : function( userId, cb ) {

    var thisModule = this

    thisModule.getLinkedAccountsFromId( userId, function( err, credentials ) {

        thisModule.getMetricsFromLinkedAccounts( credentials, function( err, metrics ) {

            if ( err ) {

                console.log("\n", emoji.get("bangbang"), emoji.get("bangbang"), 'Get insights from id error:', err.message);
                cb ( err )

            } else {

              //console.log( "\n", emoji.get("moneybag"), 'Got all metrics from linked accounts', ' for user:', credentials.user.username, 'company id:', credentials.user.user_id )

              thisModule.getInsightsFromMetrics( metrics, function( err, results ) {

                  console.log( "\n", emoji.get("moneybag"), 'Combined insights made from', results.dataSourcesList.join(','), 'for user:', credentials.user.username, 'company id:', credentials.user.user_id )

                  var insightsInfo = {
                    results: results,
                    credentials: credentials,
                  }

                  if ( cb ) {
                    cb( null, insightsInfo)
                  } else {
                    return insightsInfo
                  }

              })

            }

        })

    })



  },

  getCompanySettings : function(userId, done) {
    
    Model.Company.findOne({
    
      where: {
        id: userId
      }
    
    }).then(function ( company ) {
    
      if (!company) {
    
        console.log("There is no user#", userId);
    
      }
    
      else {
    
        Async.waterfall([
    
          function ( cb ) {   
      
            company.getSetting().then(function (setting) {
    
              if (setting) {
    
                cb(null, setting)
    
              }
    
              else {
    
                Model.Setting.create({
    
                  insights_time: '15 minutes',
                  insights_to: 'All attendees'    
        
                }).then(function (setting) {
        
                  company.setSetting( setting ).then(function (){
                   
                    cb(null, setting)
        
                  })
        
                })
        
              }
        
            })
           
          }
          
        ], function (err, result) {
          done(err, result);
        })
      }
    })
  }

}

module.exports = users