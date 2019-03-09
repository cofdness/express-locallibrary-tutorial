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

//setup mongoose connection

let mongoose = require('mongoose')
const mongoDB = 'mongodb://Phung:Phung1234@localhost:27017/local-library'
mongoose.connect(mongoDB, { useNewUrlParser: true })
let db = mongoose.connection
db.on('error', () => {console.log('MongoDB connection error:')})
// view engine setup
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
app.use('/users', usersRouter);
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
