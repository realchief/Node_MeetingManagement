module.exports = (sequelize, DataTypes) => {
    let Settings = sequelize.define('Settings', {
        insights_time: {
            type: DataTypes.STRING
        },
        insights_to: {
            type: DataTypes.STRING
        }     
    });

    Settings.associate = function(models) {
        models.Google.hasOne(models.User);
    };

    return Settings;
};