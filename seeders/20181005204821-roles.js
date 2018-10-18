'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
  
    return queryInterface.bulkInsert('Roles', [{
        role_name: 'admin',
        role_label: 'Administrator',
        role_description: 'Administrator access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role_name: 'team_member',
        role_label: 'Team Member',
        role_description: 'Team Member access',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});

  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  }
};
