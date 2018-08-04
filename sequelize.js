var Sequelize = require('sequelize'),
    sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/testdb')

module.exports = sequelize