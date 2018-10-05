module.exports = (sequelize, DataTypes) => {
    let Phrase = sequelize.define('Phrase', {
        type: {
            type: DataTypes.STRING
        },
        phrase: {
            type: DataTypes.STRING
        },
        link: {
            type: DataTypes.STRING
        },
        title: {
            type: DataTypes.STRING
        },
        tags_object: {
            type: DataTypes.JSONB
        },
        all_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
        level_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
        source_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
        sentiment_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
        category_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
        type_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
        dimension_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
        metric_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
        field_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
        sortType_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
        freestand_tags: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }, 
    });

    return Phrase;
};