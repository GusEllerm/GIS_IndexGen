import type {Request, Response, NextFunction} from 'express';

const sqlite = require('better-sqlite3');
const express = require('express');
const router = express.Router();
const path = require('path');

const HISTORY_DB = path.join(__dirname, "../../LP_compilation/DB/history_DB.db")
const WORKFLOW_DB = path.join(__dirname, "../../LP_compilation/DB/workflow_DB.db")
const STATUS_FILE = path.join(__dirname, "../../LP_compilation/LP_status.txt")

const fs = require('fs')

interface current_artefacts {
    short_name: string,
    syslink: string
}

interface historical_artefact {
    syslink: string;
    data_set: string;
    datetime: string;
}

interface artefact_history {
    name: string;
    short_name: string;
    syslink: string;
    history_id: string;
    data_set: string;
    datetime: string;
}

interface historic_metadata {
    data_set: string;
    datetime: string;
}

interface historical_set {
    short_name: string;
    syslink: string;
    historical_versions: {
        short_name: string;
        syslink: string;
        data_set: string;
        datetime: string;
    }[]
}


const test_image = [
    "../test_image/322868_1100-800x825.jpg",
    "../test_image/322868_1100-800x825_copy.jpg",
    "../test_image/322868_1100-800x825_copy_2.jpg",
    "../test_image/322868_1100-800x825_copy_3.jpg",
    "../test_image/322868_1100-800x825_copy_4.jpg",
    "../test_image/322868_1100-800x825_copy_5.jpg",
]

function format_directory(directory: string|null) {
    if (directory != null) {
      let temp= path.relative(path.join(__dirname, '../../LP_compilation'), directory)
      return path.join("../", temp)
    } 
  }

/* GET users listing. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {


      // check if LP is currently compiling
    fs.readFile(STATUS_FILE, (err: any, status: string) => {
        if (err) {
        console.error(err)
        return
        }
        if (status.toString() == "1") {
            console.log("GOT THERE")
            res.render('LP_compiling', {
                title: "LivePaper V3"
              })
        } else {


    let final_set: historical_set[] = [];
    let historical_set: historical_set;

    const history_db = new sqlite(HISTORY_DB, { verbose: console.log, readonly: true, fileMustExist: true })
    const workflow_db = new sqlite(WORKFLOW_DB, { verbose: console.log, readonly: true, fileMustExist: true})

    // check there is a history to present, if not render a page with no history
    let history_num: any = history_db.prepare('SELECT count(*) AS history_num FROM history').get().history_num;
    if (history_num == 0 ) {
        // No history yet
        res.render('history', {
            title: 'LivePaper v3',
            current_artefact: "../test_image/322868_1100-800x825_copy_5.jpg",
            historical_artefacts: test_image
        })
    } else {
        // get short_name and syslink for historical_set object
        let current_artefacts: current_artefacts[] = workflow_db.prepare('SELECT short_name, syslink FROM web_interface WHERE artefact_id IN (SELECT artefact_id FROM artefact WHERE input_id != ?) AND type_id = ?;').all(1, 2);

        console.log(current_artefacts)
        current_artefacts.forEach(artefact => {
            let artefact_history: artefact_history[] = history_db.prepare('SELECT artefact.short_name AS short_name, artefact.syslink AS syslink, history.data_used AS data_set, history.datetime AS datetime FROM artefact LEFT JOIN history ON artefact.history_id = history.history_id WHERE artefact.short_name = ?').all(artefact.short_name);
            artefact_history.forEach(artefact=>{artefact.syslink = format_directory(artefact.syslink)})
            console.log(artefact_history)
            
            let historical_set: historical_set = ({
                short_name: artefact.short_name,
                syslink: format_directory(artefact.syslink),
                historical_versions: artefact_history.reverse()
            })
            final_set.push(historical_set)
        })

        console.log(final_set)
        res.render('history', {
            title: 'LivePaper v3',
            historical_artefacts: final_set
        })   
    }
}
})



});

module.exports = router;
