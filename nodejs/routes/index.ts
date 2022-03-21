import e, {Request, Response, NextFunction} from 'express';
const sqlite = require('better-sqlite3');
const sharp = require('sharp')
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const WORKFLOW_DB = path.join(__dirname, "../../LP_compilation/DB/workflow_DB.db")

type Error = import('child_process').ExecException

function format_directory(directory: string|null) {
  if (directory != null) {
    return path.relative(path.join(__dirname, '../../LP_compilation'), directory)
  } 
}

router.get('/', function(req: Request, res: Response, next: NextFunction) {

  // define materials for presentation on website
  var total_artefacts: Artefact[]
  interface Primary_out {
    name: string;
    syslink: string;
    input_id: Number;
  }
  interface Secondary_out {
    name: string;
    syslink: string;
  }

  interface Artefact {
    primary: Primary_out;
    secondary: {}[];
    svg: string|null;
  }

  interface DB_artefact {
    item_name: string,
    type_id: number,
    syslink: string,
    svg: string|null,
    workflow_id: number,
    input_id: number
  }

  const db = new sqlite(WORKFLOW_DB, { verbose: console.log, readonly: true, fileMustExist: true })
  const multi_workflow_svg = db.prepare("SELECT svg FROM workflow WHERE workflow_name = ?").all("multi_workflow.cwl")[0].svg;
  const workflow_svg = db.prepare("SELECT svg FROM workflow WHERE workflow_name = ?").all("workflow.cwl")[0].svg;

  // const tiff_objects: Web_object[] = db.prepare("SELECT item_name, syslink, artefact_id FROM web_interface WHERE type_id = 2 AND artefact_id IN (SELECT artefact_id FROM artefact WHERE workflow_id = 1)").all();
  const data_objects: DB_artefact[] = db.prepare('SELECT item_name, web_interface.type_id, web_interface.syslink, web_interface.svg, artefact.workflow_id, artefact.input_id FROM web_interface LEFT JOIN artefact ON web_interface.artefact_id = artefact.artefact_id WHERE workflow_id = 2').all()

  // define artefacts that were generated using the same input as a set
  const input_ids = new Set()
  for (const index in data_objects) input_ids.add(data_objects[index].input_id)

  function compile_artefacts() {
    return new Promise(resolve => {
      input_ids.forEach(input_id => {
        // console.log(input_id)
        var artefact_set: DB_artefact[] = data_objects.filter(artefact => {
          return artefact.input_id === input_id
        })
        
        // create primary artefact object
    
        let primary_artefact: DB_artefact = artefact_set.filter(artefact => { return artefact.type_id === 2})[0]
        let primary_out: Primary_out = {name: primary_artefact.item_name, syslink: format_directory(primary_artefact.syslink), input_id: primary_artefact.input_id,}
        
        // console.log(primary_artefact.svg)
    
        let secondary_artefacts: DB_artefact[] = artefact_set.filter(artefact => { return artefact.type_id == 3})
        let all_secondary: Secondary_out[] = []
        secondary_artefacts.forEach(artefact => {
          // console.log(artefact)
          let secondary_artefact: Secondary_out = { name: artefact.item_name, syslink: format_directory(artefact.syslink) }
          all_secondary.push(secondary_artefact)
        });
        
        let final_artefact: Artefact = {primary: primary_out, secondary: all_secondary, svg: format_directory(primary_artefact.svg)}
        if (total_artefacts == null) {
          total_artefacts = [final_artefact]
        } else {
          total_artefacts.push(final_artefact)
        }
      });
      resolve(total_artefacts)
    })
  }

  const artefacts = compile_artefacts
  artefacts().then(artefacts => {
    res.render('index', {
      title: 'LivePaper V2',
      artefacts: artefacts,
      num_artefacts: 7,
      multi_workflow_svg: format_directory(multi_workflow_svg),
      workflow_svg: format_directory(workflow_svg)
    })
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
