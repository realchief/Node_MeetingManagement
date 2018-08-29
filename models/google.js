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
        view_id: {
            type: DataTypes.STRING
        },
<<<<<<< HEAD
        property_id: { type: DataTypes.STRING }, 
        account_id: { type: DataTypes.STRING }, 
=======
        property_id: {
            type: DataTypes.STRING
        },
        account_id: {
            type: DataTypes.STRING
        }

>>>>>>> d6f2d8a69097a698484147a6bfb1137651f84c72
    });

    Google.associate = function(models) {
        models.Google.hasOne(models.User);
    };

    return Google;
};