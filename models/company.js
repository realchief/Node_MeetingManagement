'use strict';
let bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    
    const Company = sequelize.define('Company', {
        company_name: {
            type: DataTypes.STRING
        },
        creator_email: {
            type: DataTypes.STRING
        },
        whitelisted_domains: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
    });

    Company.beforeCreate( (company, options) => {
        
          var whitelisted_domains = company.creator_email.split('@')[1].toLowerCase();
          company.whitelisted_domains = [ whitelisted_domains ]
     
    });

    Company.beforeUpdate( (company, options) => {

       if ( company.whitelisted_domains == "") {
            var whitelisted_domains = company.creator_email.split('@')[1].toLowerCase();
            company.whitelisted_domains = [ whitelisted_domains ]
       }

    })

  
    Company.associate = function(models) {
        models.Company.belongsTo(models.Facebook);
        models.Company.belongsTo(models.Google);
        models.Company.hasOne(models.Setting);
        models.Company.hasMany(models.User);
    };

    return Company;
};

