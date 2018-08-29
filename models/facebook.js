module.exports = (sequelize, DataTypes) => {
    let Facebook = sequelize.define('Facebook', {
        token: {
            type: DataTypes.STRING
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
        given_name: {
            type: DataTypes.STRING
        },
        family_name: {
            type: DataTypes.STRING
        },
        expiry_date: {
            type: DataTypes.INTEGER
        },
        account_id: {
            type: DataTypes.STRING
        },
        account_name: {
            type: DataTypes.STRING
        },
        account_token: {
            type: DataTypes.STRING
        }
    });

    Facebook.associate = function(models) {
        models.Facebook.hasOne(models.User);
    };

    return Facebook;
};