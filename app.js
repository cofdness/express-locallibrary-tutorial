var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let catalogRouter = require('./routes/catalog')
const compression = require('compression')
const helmet = require('helmet')
var app = express();
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

//setup mongoose connection

let mongoose = require('mongoose')
const mongoDB = 'mongodb+srv://Phung:QYiFOORk8Q8qO09Y@cluster0-qjuj6.azure.mongodb.net/local-library?retryWrites=true'
mongoose.connect(mongoDB, { useNewUrlParser: true })
let db = mongoose.connection
db.on('error', () => {console.log('MongoDB connection error:')})
// view engine setup

app.use(session({
  secret: 'love music request',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}))

//make user ID available in templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId
  next()
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(helmet())
app.use(compression())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/catalog', catalogRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
