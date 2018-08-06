'use strict';
var bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        company_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    User.beforeCreate((user, options) => {
        return bcrypt.hash(user.password, 10).then(function (hash) {
            user.password = hash;
        })
    });
    
    return User;
};

