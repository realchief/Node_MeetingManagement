module.exports = (sequelize, DataTypes) => {
    let Setting = sequelize.define('Setting', {
        insights_time: {
            type: DataTypes.STRING,
            defaultValue: '15 minutes'          
        },
        insights_to: {
            type: DataTypes.STRING,
            defaultValue: 'All attendees'
        }     
    });

    /*Setting.associate = function(models) {
        models.Setting.hasOne(models.Company);
    };*/

    return Setting;
};