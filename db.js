var knex = require('knex')({
    client: 'postgres',
    // Uncomment to enable SQL query logging in console.
    // debug   : true,
    connection: {
        host    : '127.0.0.1',
        user    : 'postgres',
        password: 'postgres',
        database: 'oauth_test',
        charset : 'utf8',
    }        
});

var DB = require('bookshelf')(knex);

module.exports.DB = DB;