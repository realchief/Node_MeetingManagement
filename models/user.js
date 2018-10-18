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
        user_id: {
            type: DataTypes.STRING
        },
        email_domain: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING,
        },
        timezone: {
            type: DataTypes.STRING,
        }
    });

    User.beforeCreate( (user, options) => {
        
        //var user_id = user.email.replace(/.*@/, "").split('.')[0].toLowerCase();
        
        var user_id = user.email.toLowerCase();
        user.user_id = user_id
    
        var email_domain = user.email.split('@')[1].toLowerCase();
        user.email_domain = email_domain
    
    });

    User.beforeUpdate( (user, options) => {

        if ( user.changed('user_id') ) {
            console.log('USER CHANGED User ID')
        } else {
          
        }

        if ( user.changed('email_domain') ) {
            console.log('USER CHANGED EMAIL DOMAIN')
        } else {
           
        }

         if ( user.user_id == "") {
            var user_id = user.email.toLowerCase();
            user.user_id = user_id
       }

       if ( user.email_domain == "") {
            var email_domain = user.email.split('@')[1].toLowerCase();
            user.email_domain = email_domain
       }

    })

    User.beforeSave( (user, options) => {
        
        if (user.changed('password')) {
            return bcrypt.hash(user.password, 10).then(function (hash) {
                user.password = hash;
            });
        } else {
          Promise.resolve();  
        } 
    
    });

    User.associate = function(models) {
       //models.User.belongsTo(models.UserSetting);
        models.User.belongsTo(models.Company);
        models.User.belongsTo(models.Role);
        models.User.hasMany(models.Meeting);
    };

    return User;
};

