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
        property_id: {
            type: DataTypes.STRING
        },
        property_name: {
            type: DataTypes.STRING
        },
        account_id: {
            type: DataTypes.STRING
        },
        account_name: {
            type: DataTypes.STRING
        },
        view_name: {
            type: DataTypes.STRING
        },
        property_name: {
            type: DataTypes.STRING
        }
    });

    Google.associate = function(models) {
        models.Google.hasOne(models.Company);
    };

    return Google;
};