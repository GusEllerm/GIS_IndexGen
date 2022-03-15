import {Request, Response, NextFunction} from 'express';
const sqlite = require('better-sqlite3');
const sharp = require('sharp')
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const WORKFLOW_DB = path.join(__dirname, "../../LP_compilation/DB/workflow_DB.db")

type Error = import('child_process').ExecException

function format_directory(directory: string) {
  return path.relative(path.join(__dirname, '../../LP_compilation'), directory)
}

router.get('/', function(req: Request, res: Response, next: NextFunction) {

  interface Object_indexs {
    syslink: string
  }

  const db = new sqlite(WORKFLOW_DB, { verbose: console.log, readonly: true, fileMustExist: true })
  const multi_workflow_svg = db.prepare("SELECT svg FROM workflow WHERE workflow_name = ?").all("multi_workflow.cwl")[0].svg;
  const workflow_svg = db.prepare("SELECT svg FROM workflow WHERE workflow_name = ?").all("workflow.cwl")[0].svg;

  const object_indexs: Object_indexs[] = db.prepare("SELECT syslink FROM web_interface WHERE type_id = 2 AND artefact_id IN (SELECT artefact_id FROM artefact WHERE workflow_id = 1)").all();
  const indexs: string[] = []
  object_indexs.forEach(index => {
    indexs.push(format_directory(index.syslink))
  });

  res.render('index', {
    title: 'LivePaper V2',
    indexes: indexs,
    multi_workflow_svg: format_directory(multi_workflow_svg),
    workflow_svg: format_directory(workflow_svg)
  })
})




// /* GET home page. */
// router.get('/', function(req: Request, res: Response, next: NextFunction) {
//   if (!BLOCK) {
//     let webp_dir: string[] = get_webp();
//     let multi_workflow_svg = "svg/multi_workflow.svg"
//     let workflow_svg = "svg/workflow.svg"
//     res.render('index', { 
//       title: 'LivePaper',
//       indexes: webp_dir,
//       multi_workflow_svg: multi_workflow_svg,
//       workflow_svg: workflow_svg
//     });  
//   } else {
//     console.log("Compiling new research artefacts")
//   }
// });

// /* POST home page */
// router.post('/', function(req: Request, res: Response, next: NextFunction) {
//   if (!BLOCK) {
//     if (req.body.compute_dataset == 1) {
//       runCalculation(res, req, req.body.compute_dataset).then(() => {delay(5000).then(() => {res.redirect('/')})})
//     } else if (req.body.compute_dataset == 2) {
//       runCalculation(res, req, req.body.compute_dataset).then(() => {delay(5000).then(() => {res.redirect('/')})})
//     } else if (req.body.compute_dataset == 3) {
//       runCalculation(res, req, req.body.compute_dataset).then(() => {delay(5000).then(() => {res.redirect('/')})})
//     }
//   } else {
//     console.log("Compiling new research artefacts")
//   } 
// });

module.exports = router;
