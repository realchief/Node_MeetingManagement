module.exports = (sequelize, DataTypes) => {
    let Google = sequelize.define('Google', {
        token: {
            type: DataTypes.STRING
        },
        refresh_token: {
            type: DataTypes.STRING
        },
        profile_id: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        display_name: {
            type: DataTypes.STRING
        }
    });

    Google.associate = function(models) {
        models.Google.hasOne(models.User);
    };

    return Google;
};