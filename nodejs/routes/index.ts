import {Request, Response, NextFunction} from 'express';
type Error = import('child_process').ExecException
var sharp = require('sharp')

var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');

// Super simple blocking mechanism to prevent button spam
var BLOCK = false;

// delay function to deal with async problems
function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

// Gets a list of webp stored within public/webp
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

// Generates webp by converting tiff artefacts (public/tiff) to webp artefacts (public/webp)
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

// executes a shell command - used to run workflows through CWL
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

// Runs workflows and generated artefacts for display on website.
async function runCalculation(res: Response, req: Request, dataset: Number) {
  BLOCK = true;
  if (dataset == 1) {
    console.log('Calculating over dataset 1');
    const calculate = await execShellCommand('pipenv shell; cd public/tiff/; python remove_tiff_output.py; cd ../; cd webp; python remove_webp_files.py; cd ../; cd tiff/; python workflow_1.py');
    console.log(calculate);
    const gen_svg = await execShellCommand('pipenv shell; cd public/svg/; python remove_svg_output.py; python multi_workflow.py; python workflow.py')
    console.log(gen_svg)
  } else if (dataset == 2) {
    console.log('Calculating over dataset 2');
    const calculate = await execShellCommand('pipenv shell; cd public/tiff/; python remove_tiff_output.py; cd ../; cd webp; python remove_webp_files.py; cd ../; cd tiff/; python workflow_2.py');
    console.log(calculate);
  } else if (dataset == 3) {
    console.log('Calculating over dataset 3');
    const calculate = await execShellCommand('pipenv shell; cd public/tiff/; python remove_tiff_output.py; cd ../; cd webp; python remove_webp_files.py; cd ../; cd tiff/; python workflow_3.py');
    console.log(calculate);
  }
  const generate_webp = await gen_webp();
  console.log(generate_webp);
  BLOCK = false;
  console.log(generate_webp);
}


/* GET home page. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  if (!BLOCK) {
    let webp_dir: string[] = get_webp();
    let multi_workflow_svg = "svg/multi_workflow.svg"
    let workflow_svg = "svg/workflow.svg"
    res.render('index', { 
      title: 'LivePaper',
      indexes: webp_dir,
      multi_workflow_svg: multi_workflow_svg,
      workflow_svg: workflow_svg
    });  
  } else {
    console.log("Compiling new research artefacts")
  }
});

/* POST home page */
router.post('/', function(req: Request, res: Response, next: NextFunction) {
  if (!BLOCK) {
    if (req.body.compute_dataset == 1) {
      runCalculation(res, req, req.body.compute_dataset).then(() => {delay(5000).then(() => {res.redirect('/')})})
    } else if (req.body.compute_dataset == 2) {
      runCalculation(res, req, req.body.compute_dataset).then(() => {delay(5000).then(() => {res.redirect('/')})})
    } else if (req.body.compute_dataset == 3) {
      runCalculation(res, req, req.body.compute_dataset).then(() => {delay(5000).then(() => {res.redirect('/')})})
    }
  } else {
    console.log("Compiling new research artefacts")
  } 
});

module.exports = router;
