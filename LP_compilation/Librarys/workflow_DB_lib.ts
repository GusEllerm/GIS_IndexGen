import { Resolver } from "dns";

const fs = require('fs');
const path = require('path');
const sqlite = require('better-sqlite3');
const exec = require('child_process').exec;

const DB_NAME = path.join(__dirname, "../", "DB/", "workflow_DB.db");
const TEMP = path.join(__dirname, "temp")
const CWL_DIR = path.join(__dirname, "../", "Data_stages/", "CWL/")
const IMAGE_DIR = path.join(__dirname, "../", "Workflow_IO/", "Outputs/", "Images/")

export function initialise_workflowDB () {

    if (fs.existsSync(DB_NAME)) {
        console.log(DB_NAME + ' is initialized - migrate?');
        return {
            error: true,
            message: DB_NAME + ' already exists, did you mean to migrate'
        }
    }
    
    console.log('\n - initalising workflowDB - \n');
    const db = new sqlite(DB_NAME, {verbose: console.log})
    // Add workflow table
    db.prepare('CREATE TABLE workflow (workflow_name varchar UNIQUE NOT NULL PRIMARY KEY, syslink varchar NOT NULL)').run();
    // Add input table
    db.prepare('CREATE TABLE input (input_name varchar UNIQUE NOT NULL PRIMARY KEY, syslink varchar NOT NULL)').run();
    // Add output table
    db.prepare('CREATE TABLE artefact (artefact_name varchar UNIQUE NOT NULL PRIMARY KEY, short_name varchar UNIQUE NOT NULL, syslink varchar UNIQUE NOT NULL, workflow_name varchar NOT NULL, input_name varchar NOT NULL, FOREIGN KEY(workflow_name) REFERENCES workflow, FOREIGN KEY(input_name) REFERENCES input)').run();
}

export function add_workflow() {
    // Insert workflows (static)
    // check that the workflows are there
    if (!fs.existsSync(CWL_DIR + 'multi_workflow.cwl')) {
        console.log("\n - Unable to find multi_workflow.cwl - \n");
        return
    }
    if (!fs.existsSync(CWL_DIR + 'workflow.cwl')) {
        console.log('\n - Unable to find workflow.cwl - \n');
        return
    }
    const db = new sqlite(DB_NAME, { verbose: console.log, fileMustExist: true })
    const insert_workflow = db.prepare('INSERT INTO workflow (workflow_name, syslink) VALUES (@workflow_name, @syslink)');
    console.log(CWL_DIR + 'multi_workflow.cwl');
    insert_workflow.run({workflow_name: 'multi_workflow.cwl', syslink: CWL_DIR + 'multi_workflow.cwl'});
    insert_workflow.run({workflow_name: 'workflow.cwl', syslink: CWL_DIR + 'workflow.cwl'});
}

export function add_input(input_path: string) {
    const db = new sqlite(DB_NAME, { verbose: console.log, fileMustExist: true });
    const insert_input = db.prepare('INSERT INTO input (input_name, syslink) VALUES (@input_name, @syslink)');
    insert_input.run({input_name: path.basename(input_path), syslink: path.join(input_path)});
}

export function add_artefact(workflow: string, input: string) {
    // Artefacts are stored within a file structure that 

    // This runs a workflow with an input
    // creates a temp directory
    // runs workflow from within that directory and captures stdout to file
    // stdout file is read as object containing all workflow artefacts
    // this file can be used to integrate the results to the workflow database

    // Make sure workflow and input exist in the workflow database

    return new Promise(function(resolve, reject) {

        console.log("\n - attempting to compile workflow - \n");
        const db = new sqlite(DB_NAME, { verbose: console.log, fileMustExist: true });
        const workflow_exists = db.prepare('SELECT EXISTS (SELECT 1 FROM workflow WHERE workflow_name = ?)');
        const input_exists = db.prepare('SELECT EXISTS (SELECT 1 FROM input WHERE input_name = ?)');

        if (!(workflow_exists.get(workflow)['EXISTS (SELECT 1 FROM workflow WHERE workflow_name = ?)'] && input_exists.get(input)['EXISTS (SELECT 1 FROM input WHERE input_name = ?)'])) {
            console.log("\n *** workflow / input is not found in " + DB_NAME + " *** \n");
            return
        }

        // workflow and input found, create temp staging directory
        console.log("\n - Creating temp directory - \n");
        exec('mkdir ' + TEMP);
        console.log(" - running " + workflow + " with " + input + " input file - \n");

        // get workflow and input syslinks
        const workflow_syslink = db.prepare('SELECT syslink FROM workflow WHERE workflow_name = ?').get(workflow).syslink;
        const input_syslink = db.prepare('SELECT syslink FROM input WHERE input_name = ?').get(input).syslink;

        // Define input queries for artefact database
        const insert_artefact = db.prepare('INSERT INTO artefact (artefact_name, short_name, syslink, workflow_name, input_name) VALUES (@artefact_name, @short_name, @syslink, @workflow_name, @input_name)');

        let execute_CWL =  '/; cwl-runner ' + workflow_syslink + ' ' + input_syslink + " | tee artefacts.txt"



        // Execute the workflow within the temp folder and generate an output object
        let child = exec('cd ' + TEMP + execute_CWL, (err: any, stdout: any, stderr: any) => {
            if (err) {
                console.log("ERROR")
                console.log(err)
                return
            }
            // console.log(stdout)
        });

        child.on('exit', function() {
            // import the aftefact object
            console.log(path.resolve(__dirname, path.join(TEMP + '/','artefacts.txt')));
            let artefacts = JSON.parse(fs.readFileSync(path.resolve(__dirname, path.join(TEMP + '/','artefacts.txt'))));
            
            let filetypes = new Set<string>();
            for (const artefact in artefacts) {
                filetypes.add(String(path.parse(artefacts[artefact].basename).ext))
            }
            
            // create non-temp file structure to store artefacts in.
            // Record a set of these to hand over to the webp generator
            
            const directories = new Set<string>();
            
            console.log("\n - Creating filetype directory structure - \n");
            filetypes.forEach(filetype => {
                let directroy = path.join(IMAGE_DIR, filetype.substring(1), "/");
                directories.add(directroy);
                if (!fs.existsSync(directroy)) {
                    console.log("directory does not exist");
                    exec('mkdir ' + directroy);
                } else {
                    console.log("directory exists");
                }
            })
        
            for (const artefact in artefacts) {
                let newpath: string = path.join(IMAGE_DIR, String(path.parse(artefacts[artefact].basename).ext).substring(1));
                exec('mv ' + artefacts[artefact].path + " " + newpath);

                // calculate and add short_name
                let short_name_array = artefacts[artefact].basename.split('_');
                let short_name = short_name_array.slice(-2)[0].concat("_", short_name_array.slice(-2)[1]);

                // Insert artefact into database
                insert_artefact.run({
                    artefact_name: artefacts[artefact].basename,
                    short_name: short_name,
                    syslink: path.join(newpath, artefacts[artefact].basename),
                    workflow_name: workflow,
                    input_name: input
                })
            }

            console.log("\n - Removing temp directory - \n");
            exec('rm -rf ' + TEMP);

            resolve(directories);
        })
    })    

}
