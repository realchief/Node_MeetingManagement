var Sequelize = require('sequelize')
 
// var attributes = {
//   username: {
//     type: Sequelize.STRING,
//     allowNull: false,
//     unique: true,
//     validate: {
//       is: /^[a-z0-9\_\-]+$/i,
//     }
//   },
//   email: {
//     type: Sequelize.STRING,
//     validate: {
//       isEmail: true
//     }
//   },
//   administratorName: {
//     type: Sequelize.STRING,
//   },
//   companyName: {
//     type: Sequelize.STRING,
//   },
//   password: {
//     type: Sequelize.STRING,
//   }
// }
 
// var options = {
//   freezeTableName: true
// }
 
// module.exports.attributes = attributes
// module.exports.options = options


const User = sequelize.define('user', {
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
});
  
// force: true will drop the table if it already exists
User.sync({force: true}).then(() => {
    // Table created
    return User.create({
        administratorName: 'Aleksandar Glisobic',
        email: 'alekssoftdev@gmail.com',
        companyName: 'realchief',
        password: 'P@ssw0rd.'
    });
});