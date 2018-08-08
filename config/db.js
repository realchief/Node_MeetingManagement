module.exports = {
    development: {
        database: 'testdb',
        username: 'postgres',
        password: 'postgres',
        host: 'localhost',
        dialect: 'postgres',
    
        pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
        },

        // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
        operatorsAliases: false
    },
    production: {

    }
}