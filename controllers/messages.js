let Model = require('../models');
let Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')

let facebookApi = require('../controllers/facebook-api');
let googleApi = require('../controllers/google-analytics-api');

var _ = require('lodash');

var messages = {

  getPrompts : function( req, res, next, cb ) {

    return new Promise(function(resolve, reject) {

      var sessionPrompt = {}

      if ( req.user ) {

        /*sessionPrompt = {
          type: 'info',
          message: 'Hey yo.'
        }*/

      }
      
      resolve(sessionPrompt)
    
    })

  }

}

module.exports = messages