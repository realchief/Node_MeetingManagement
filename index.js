'use strict';

require('dotenv').config({path: './variables.env'})
var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var exphbs  = require('express-handlebars');
var handlebarsHelpers = require('handlebars-helpers')();
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helpers = require('./helpers');

var passport = require('passport');

var models = require('./models');
var flash = require('connect-flash');
var emails = require('./controllers/emails');
var Model = require('./models');
var Async = require('async');
var moment = require('moment');

let facebookApi = require('./controllers/facebook-api');
let googleApi = require('./controllers/google-analytics-api');

var routes = require('./routes/index');
var authRoutes = require('./routes/auth.js');
var parseRoutes = require('./routes/parse');
var testRoutes = require('./routes/tests');
var scheduleRoutes = require('./routes/schedule');
var dataRoutes = require('./routes/data');
var userRoutes = require('./routes/user');


var colors = require('colors');
var emoji = require('node-emoji')

require('./passport.js')(passport);

var establishSecurePort = false;

if (  typeof process.env.PRIVATE_KEY_PATH != 'undefined' && 
      typeof process.env.CERTIFICATE_PATH != 'undefined' && 
      typeof process.env.SECURE_PORT != 'undefined' &&
      typeof process.env.CONSUMER_SECURE_URL != 'undefined' ) {
      establishSecurePort = true;
}

var secureRedirect = false;

if ( process.env.SECURE_ONLY == 'true') {
      secureRedirect = true;
} 

var morgan = require('morgan');
var session = require('express-session');
var cookieSession = require('cookie-session');

var app = express();

app.engine('handlebars', exphbs({
    defaultLayout: process.env.HOME_VERSION,
    layoutsdir: __dirname + '/views/layouts/',
    partialsdir: __dirname + '/views/partials/',
    helpers : {
      moment : require('helper-moment'),
      toJSON : function(object) {
       return JSON.stringify(object, null, 2);
      }
    }
}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


if ( secureRedirect ) {

  app.use(function(req, res, next) {
    var schema = req.headers['x-forwarded-proto'];
    if (schema === 'https') {
      next();
    }
    else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });

}

app.set('trust proxy', 1)

var cookieOptions = {
   maxAge: null,
   httpOnly: true
}

if ( secureRedirect ) {
  cookieOptions.secure = true;
}

app.use(session({ 
  secret: "fingertipsy", 
  resave: false, 
  saveUninitialized: false,
  cookie: cookieOptions
}));

// serves up static files from the public folder. Anything in static/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'static')));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// DEBUG REQUESTS
app.use(function(req, res, next) {
  //console.log('handling request for: ' + req.url);
  next();
});

// pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.currentPath = req.path;
  res.locals.session = req.session;
  next();
});

app.use(googleApi.checkToken);
app.use(facebookApi.checkToken);

// route incoming requests to the correct pages
app.use('/', routes)
app.use('/', parseRoutes)
app.use('/', testRoutes)
app.use('/', dataRoutes)
app.use('/', scheduleRoutes)
app.use('/', userRoutes)
app.use('/auth', authRoutes);

// lastly, handle any errors 
app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});


// start the server
models.sequelize.sync().then(function() {
  
  var port = process.env.PORT || 3001;
  
  var server = http.createServer(app).listen(port, function() {
  
  console.log('\n', '---- restarted server ----', moment().format("ddd, MMMM D [at] h:mma"), '\n');
  
  // RUN ALL STOPPED SCHEDULED JOBS
  emails.reschedule()
  
  console.log('Express server listening on port ' + port);

 });

  /* FOR HTTPS */

  if ( establishSecurePort) {

    var options = {
      key: fs.readFileSync( process.env.PRIVATE_KEY_PATH, 'utf8' ),
      cert: fs.readFileSync( process.env.CERTIFICATE_PATH, 'utf8' ),
    };

    if ( typeof process.env.CA_PATH !== 'undefined' ) {
      options.ca = fs.readFileSync( process.env.CA_PATH, 'utf8' )
    }

    var securePort = process.env.SECURE_PORT || 3443;
    https.createServer(options, app).listen(securePort, function() {
      console.log('Express secure server listening on port ' + securePort);
    });
  }
})
