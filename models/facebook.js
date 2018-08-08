module.exports = (sequelize, DataTypes) => {
    let Facebook = sequelize.define('Facebook', {
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
        given_name: {
            type: DataTypes.STRING
        },
        family_name: {
            type: DataTypes.STRING
        }
    });

    Facebook.associate = function(models) {
        models.Facebook.hasOne(models.User);
    };

    return Facebook;
};