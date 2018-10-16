module.exports = (sequelize, DataTypes) => {
    let Meeting = sequelize.define('Meeting', {
        summary: {
            type: DataTypes.STRING
        },
        start_time: {
            type: DataTypes.DATE
        },
        end_time: {
            type: DataTypes.DATE
        },
        // start_date: {
        //     type: DataTypes.STRING
        // },
        // end_date: {
        //     type: DataTypes.STRING
        // },
        start_date: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        end_date: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        organizer: {
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
        is_recurring: {
            type: DataTypes.BOOLEAN
        },        
        meeting_id: {
            type: DataTypes.STRING
        },
        timezone: {
            type: DataTypes.STRING
        },
        dtstamp_time: {
             type: DataTypes.DATE
        },
        created_time: {
             type: DataTypes.DATE
        },
        sequence: {
            type: DataTypes.STRING
        },
        user_id: {
            type: DataTypes.STRING
        },
        sendgrid_recipients: {
            type: DataTypes.ARRAY(DataTypes.JSONB)
        }
    });

    Meeting.associate = function(models) {
        models.Meeting.belongsTo(models.User);
    };

    return Meeting;
};