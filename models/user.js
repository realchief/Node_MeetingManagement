var Sequelize = require('sequelize')
 
var attributes = {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-z0-9\_\-]+$/i,
    }
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  },
  administratorName: {
    type: Sequelize.STRING,
  },
  companyName: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  }
}
 
var options = {
  freezeTableName: true
}
 
module.exports.attributes = attributes
module.exports.options = options