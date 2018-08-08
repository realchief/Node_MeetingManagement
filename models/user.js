'use strict';
let bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        company_name: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        facebook_token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        google_token: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    User.beforeSave((user, options) => {
        if (user.changed('password'))
            return bcrypt.hash(user.password, 10).then(function (hash) {
                user.password = hash;
            });
        else Promise.resolve();
    });

    User.associate = function(models) {
        models.User.belongsTo(models.Facebook);
    };

    return User;
};

