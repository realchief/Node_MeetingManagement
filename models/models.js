
var UserMeta = require('./user.js'),
    connection = require('../sequelize.js')
 
var User = connection.define('user', UserMeta.attributes, UserMeta.options)

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

// you can define relationships here 
module.exports.User = User