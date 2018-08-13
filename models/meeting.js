module.exports = (sequelize, DataTypes) => {
    let Meeting = sequelize.define('Meeting', {
        meeting_name: {
            type: DataTypes.STRING
        },
        start_time: {
            type: DataTypes.DATE
        },
        end_time: {
            type: DataTypes.DATE
        },
        summary: {
            type: DataTypes.TEXT
        },
        sender: {
            type: DataTypes.STRING
        },
        to: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        is_sent: {
            type: DataTypes.BOOLEAN
        }
    });

    Meeting.associate = function(models) {
        models.Meeting.belongsTo(models.User);
    };

    return Meeting;
};