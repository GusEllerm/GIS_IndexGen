var express = require('express');
var router = express.Router();

var fs = require('fs')
var path = require('path')

var files = fs.readdirSync('public/png')



/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(files)
  var pngs = files.filter(file => {
    return path.extname(file).toLowerCase() === '.png'
  })

  var pngs_dir = []
  pngs.forEach(png => {
    pngs_dir.push('png/'.concat(png))
  })

  res.render('index', { 
    title: 'LivePaper',
    indexes: pngs_dir
  });  
});

module.exports = router;
