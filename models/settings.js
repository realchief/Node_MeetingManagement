module.exports = (sequelize, DataTypes) => {
    let Settings = sequelize.define('Settings', {
        insights_time: {
            type: DataTypes.ENUM, 
            values: ['15 minutes', '30 minutes', '1 hour', '2 hours'],
            defaultValue: '15 minutes'          
        },
        insights_to: {
            type: DataTypes.ENUM,
            values: ['All attendees', 'Internal attendees', 'Just Me'],
            defaultValue: 'All attendees'
        }     
    });

    Settings.associate = function(models) {
        models.Settings.hasOne(models.User);
    };

    return Settings;
};