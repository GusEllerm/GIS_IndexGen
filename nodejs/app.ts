import { error } from "console";
import type {Request, Response, NextFunction} from 'express';

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index.ts');
var usersRouter = require('./routes/users.ts');
var waitRouter = require('./routes/wait.ts');

var fs = require('fs');
var path = require('path');
var sharp = require('sharp')

var app = express();
let tiffs_dir: string[] = []

interface Error {
  status?: number;
  message?: string;
}

// TODO: make this a callback function

// Get tiff files for conversion to png
var files: string[] = fs.readdirSync('public/tiff')
var tiffs: string[] = files.filter(file => {
  return path.extname(file).toLowerCase() === '.tif'
})
tiffs.forEach(tiff => {
  tiffs_dir.push('public/tiff/'.concat(tiff))
})
tiffs_dir.forEach(tiff => {
  sharp(tiff)
    .webp()
    .toFile('public/webp/'.concat(path.parse(tiff).name, '.webp'))
    .then(function(info: string) {
      console.log(info)
    })
    .catch(function(err: Error) {
      console.log(err)
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
app.use('/wait', waitRouter)


// catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: Error, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
