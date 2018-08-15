module.exports = (sequelize, DataTypes) => {
    let Google = sequelize.define('Google', {
        token: {
            type: DataTypes.TEXT
        },
        refresh_token: {
            type: DataTypes.TEXT
        },
        profile_id: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        display_name: {
            type: DataTypes.STRING
        },
        expiry_date: {
            type: DataTypes.INTEGER
        },
        id_token: {
            type: DataTypes.TEXT
        },
        token_type: {
            type: DataTypes.STRING
        },

    });

    Google.associate = function(models) {
        models.Google.hasOne(models.User);
    };

    return Google;
};