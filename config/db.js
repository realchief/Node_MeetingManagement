require('dotenv').config({path: '../variables.env'})

console.log( 'Database Name>>>', process.env.RDS_DB_NAME, process.env.NODE_ENV)

module.exports = {
    
    development: {
    
        database: process.env.DATABASE_NAME,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        port: 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
        },
       
        operatorsAliases: false,
       // use_env_variable: true
    },

    staging: {

        database: process.env.RDS_DB_NAME,
        username: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        host: process.env.RDS_HOSTNAME,
        port: process.env.RDS_PORT,
        dialect: 'postgres',
        logging: false,
        pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
        },
       
        operatorsAliases: false,

    }

}