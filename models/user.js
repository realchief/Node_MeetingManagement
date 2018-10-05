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
        company_id: {
            type: DataTypes.STRING
        },
        company_id_full: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING,
        },
        timezone: {
            type: DataTypes.STRING,
        }
    });

    User.beforeSave((user, options) => {
        
        var company_id = user.email.replace(/.*@/, "").split('.')[0].toLowerCase();
        user.company_id = company_id

        if (user.changed('password'))
            return bcrypt.hash(user.password, 10).then(function (hash) {
                user.password = hash;
            });
        else Promise.resolve();
    
    });

    User.associate = function(models) {
        models.User.belongsTo(models.Facebook);
        models.User.belongsTo(models.Google);
        models.User.belongsTo(models.Setting);
        models.User.hasMany(models.Meeting);
    };

    return User;
};

