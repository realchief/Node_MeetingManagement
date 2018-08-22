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
        start_date: {
            type: DataTypes.STRING
        },
        end_date: {
            type: DataTypes.STRING
        },
        sender: {
            type: DataTypes.STRING
        },
        file_name: {
            type: DataTypes.STRING
        },
        to: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        is_sent: {
            type: DataTypes.BOOLEAN
        },
        meeting_id: {
            type: DataTypes.STRING
        }
    });

    Meeting.associate = function(models) {
        models.Meeting.belongsTo(models.User);
    };

    return Meeting;
};