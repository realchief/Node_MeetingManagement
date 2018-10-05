module.exports = (sequelize, DataTypes) => {
    
    let Role = sequelize.define('Role', {
        role_name: {
            type: DataTypes.STRING,
        },
        role_type: {
            type: DataTypes.STRING,
        }     
    });

    Role.associate = function(models) {
        models.Role.hasMany(models.User);
    };
    
    return Role;
};
