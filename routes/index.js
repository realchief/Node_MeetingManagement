var express = require('express');
var router = express.Router();
var request = require('request')

router.get('/', function (req, res) {

    req.session.currentVersion = process.env.HOME_VERSION

    res.render(process.env.HOME_VERSION, {
    	version: process.env.HOME_VERSION,
        layout: process.env.HOME_VERSION + '.handlebars',
        register_version: 'none'
    });
});

module.exports = router