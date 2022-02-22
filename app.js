var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var fs = require('fs');
var path = require('path');
var Jimp = require('jimp')

var app = express();

// TODO: make this a callback function

// Get tiff files for conversion to png
var files = fs.readdirSync('public/tiff')
var tiffs = files.filter(file => {
  return path.extname(file).toLowerCase() === '.tif'
})
var tiffs_dir = []
tiffs.forEach(tiff => {
  tiffs_dir.push('public/tiff/'.concat(tiff))
})
tiffs_dir.forEach(tiff => {
  Jimp.read(tiff, function (err, file) {
    if (err) {
      console.log(err)
    } else {
      file.write('public/png/'.concat(path.parse(tiff).name, '.png'))
    }
  })
})

console.log(tiffs_dir)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
