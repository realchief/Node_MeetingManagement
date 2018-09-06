'use strict';

var _ = require('lodash');
var colors = require('colors');
var emoji = require('node-emoji')

module.exports = {

  up: (queryInterface, Sequelize) => {
    
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */


    var phraseMaker = require('../controllers/phrases');
    var talkingPointsPhrases = require('../schemas/phrases-talking-points');
    var insightsPhrases = require('../schemas/phrases-insights');
 
    var talkingPointsList = talkingPointsPhrases.get();
    var insightsList = insightsPhrases.get();

    var allPoints = [];
    var allInsights = [];
   
    _.forEach(talkingPointsList, function(phrase,index) {
        allPoints.push(phraseMaker.make(phrase, true))
    })

    _.forEach(insightsList, function(phrase,index) {
        allInsights.push(phraseMaker.make(phrase, true))
    })

    var allPhrases = allPoints.concat(allInsights);

    console.log( '\n', emoji.get('sparkles'), allPoints.length, ' talking points added to the database' )
    console.log( '\n', emoji.get('sparkles'), allInsights.length, ' insight phrases added to the database' )
      
    return queryInterface.bulkInsert('Phrases', allPhrases, {});

  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */

    return queryInterface.bulkDelete('Phrases', null, {});

  }
};
