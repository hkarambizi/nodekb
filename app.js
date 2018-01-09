// REQUIRE MODULES
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');
mongoose.Promise = global.Promise;

// CONNECT TO DATABASE
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;
// ANNOUNCE DB CONNECTION
db.once('open', function(){
    console.log('Connected to MongoDB')
});
// CHECK FOR DB ERRORS
db.on('error', function(err){
    console.log(err);
});


// INITIATE EXPRESS APP
const app = express();
var port = process.env.PORT || 3000;

// BRING IN MODELS
let Article = require('./models/article.js');

// SET VIEW PATH & VIEW ENGINE 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// MIDDLEWARE
// Logging requests to console with morgan
app.use(logger('dev'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set path to /public
app.use(express.static(path.join(__dirname, '/public')));

// Express session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true, //this must be true for express-message to work
    saveUninitialized: true
  }))

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global User variable
app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

// Route Files
let articles = require('./routes/articles.js');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// get home route
app.get('/', function(req, res){
    // Bring in database collection ARTICLES
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        } else {
            // console.log(articles);
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

// START SERVER
app.listen(port, function(){
    console.log('Server is running on port: ' + port);
});