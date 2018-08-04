// var Sequelize = require('sequelize'),
//     sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/testdb')

// module.exports = sequelize

DB_NAME = "testdb"
USERNAME = 'postgres'
PASSWORD = ''
HOSTNAME = 'localhost:5432'

const Sequelize = require('sequelize')
const sequelize = new Sequelize(
  DB_NAME,
  USERNAME, 
  PASSWORD,
  {
    host: HOSTNAME,
    dialect: 'postgres',
    logging: false,
    freezeTableName: true,
    operatorsAliases: false
  }
)

module.exports = sequelize