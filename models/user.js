var Sequelize = require('sequelize')

var attributes = {
    administratorName: {
        type: Sequelize.STRING,
        },
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
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

// const Sequelize = require('sequelize');

// const User = sequelize.define('user', {
//     administratorName: {
//         type: Sequelize.STRING,
//     },    
//     email: {
//         type: Sequelize.STRING,
//         validate: {
//             isEmail: true
//         }
//     },
//     companyName: {
//         type: Sequelize.STRING,
//     },
//     password: {
//         type: Sequelize.STRING,
//     }
// }); 


