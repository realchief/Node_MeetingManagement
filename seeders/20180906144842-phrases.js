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
    var talkingPointsPhrases = require('../definitions/phrases-talking-points');
    var actionItemsPhrases = require('../definitions/phrases-action-items');
    var insightsPhrases = require('../definitions/phrases-insights');
    var resourcesPhrases = require('../definitions/phrases-resources');
 
    var talkingPointsList = talkingPointsPhrases.get();
    var actionItemsList = actionItemsPhrases.get();
    var insightsList = insightsPhrases.get();
    var resourcesList = resourcesPhrases.get();

    var allTalkingPoints = [];
    var allActionItems = [];
    var allInsights = [];
    var allResources = [];
   
    _.forEach(talkingPointsList, function(phrase,index) {
        allTalkingPoints.push(phraseMaker.make(phrase, true))
    })

    _.forEach(insightsList, function(phrase,index) {
        allInsights.push(phraseMaker.make(phrase, true))
    })

    _.forEach(actionItemsList, function(phrase,index) {
        allActionItems.push(phraseMaker.make(phrase, true))
    })

    _.forEach(resourcesList, function(phrase,index) {
        allResources.push(phraseMaker.make(phrase, true))
    })

    var allPhrases = allTalkingPoints.concat(allInsights).concat(allActionItems).concat(allResources);

    console.log( '\n', emoji.get('sparkles'), allTalkingPoints.length, ' talking points added to the database' )
    console.log( '\n', emoji.get('sparkles'), allActionItems.length, ' action items added to the database' )
    console.log( '\n', emoji.get('sparkles'), allInsights.length, ' insight phrases added to the database' )
    console.log( '\n', emoji.get('sparkles'), allResources.length, ' resource phrases added to the database' )
      
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
