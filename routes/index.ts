import {Request, Response, NextFunction, response} from 'express';
const { exec } = require('child_process')
type Error = import('child_process').ExecException
var sharp = require('sharp')

var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');

var CALCULATE = false;

function get_webp(): string[] {
  console.log('Getting web-images');
  var files: string[] = fs.readdirSync('public/webp')
  var webp: string[] = files.filter(file => {
    return path.extname(file).toLowerCase() === '.webp';
  })
  var webp_dir: string[] = [];
  webp.forEach(png => {
    webp_dir.push('webp/'.concat(png));
  })
  return webp_dir;
}

function get_tiff(): string[] {
  // Get tiff files for conversion to png
  let files: string[] = fs.readdirSync('public/tiff')
  let tiffs_dir: string[] = []
  let tiffs: string[] = files.filter(file => {
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
  return tiffs_dir
}

function gen_webp() {
  return new Promise((resolve, reject) => {
    let files: string[] = fs.readdirSync('public/tiff')
    let tiffs_dir: string[] = []
    let tiffs: string[] = files.filter(file => {
      return path.extname(file).toLowerCase() === '.tif'
    })
    tiffs.forEach(tiff => {
      tiffs_dir.push('public/tiff/'.concat(tiff))
    })
    tiffs_dir.forEach((tiff, index, array) => {
      sharp(tiff)
        .webp()
        .toFile('public/webp/'.concat(path.parse(tiff).name, '.webp'))
        .catch(function(err: Error) {
          console.log(err)
        })
        if (index === tiffs_dir.length -1) resolve(tiffs_dir)
    })
  })
}

function execShellCommand(cmd: string) {
  const exec = require('child_process').exec;
  return new Promise((resolve, reject) => {
   exec(cmd, (error: Error, stdout: Buffer, stderr: Buffer) => {
    if (error) {
     console.warn(error);
    }
    resolve(stdout? stdout : stderr);
   });
  })
}

async function runCalculation(res: Response, dataset: Number) {
  if (dataset == 1) {
    console.log('Calculating over dataset 1');
    const calculate = await execShellCommand('pipenv shell; cd public/tiff/; python remove_tiff_output.py; cd ../; cd webp; python remove_png_files.py; cd ../; cd tiff/; python workflow_1.py');
    console.log(calculate);
  } else if (dataset == 2) {
    console.log('Calculating over dataset 2');
    const calculate = await execShellCommand('pipenv shell; cd public/tiff/; python remove_tiff_output.py; cd ../; cd webp; python remove_png_files.py; cd ../; cd tiff/; python workflow_2.py');
    console.log(calculate);
  } else if (dataset == 3) {
    console.log('Calculating over dataset 3');
    const calculate = await execShellCommand('pipenv shell; cd public/tiff/; python remove_tiff_output.py; cd ../; cd webp; python remove_png_files.py; cd ../; cd tiff/; python workflow_3.py');
    console.log(calculate);
  }
  const generate_webp = await gen_webp();
  console.log(generate_webp);
  res.redirect('/');
}

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  let webp_dir: string[] = get_webp();
  res.render('index', { 
    title: 'LivePaper',
    indexes: webp_dir
  });  
});

/* POST home page */
router.post('/', function(req: Request, res: Response, next: NextFunction) {
  let webp_dir: string[] = get_webp();
  if (req.body.compute_dataset == 1) {
    runCalculation(res, req.body.compute_dataset)
  } else if (req.body.compute_dataset == 2) {
    runCalculation(res, req.body.compute_dataset)
  } else if (req.body.compute_dataset == 3) {
    runCalculation(res, req.body.compute_dataset)
  }
});

module.exports = router;
