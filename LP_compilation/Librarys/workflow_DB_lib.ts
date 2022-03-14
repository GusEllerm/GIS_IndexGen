import { Resolver } from "dns";

const fs = require('fs');
const path = require('path');
const sqlite = require('better-sqlite3');
const exec = require('child_process').exec;

const DB_NAME = path.join(__dirname, "../", "DB/", "workflow_DB.db");
const CWL_DIR = path.join(__dirname, "../", "Data_stages/", "CWL/");
const IMAGE_DIR_FULL = path.join(__dirname, "../", "Workflow_IO/", "Full/", "Outputs/", "Images/");
const IMAGE_DIR_PM = path.join(__dirname, "../", "Workflow_IO/", "Piecemeal/", "Outputs/", "Images/");
const OTHER_DIR_PM = path.join(__dirname, "../", "Workflow_IO/", "Piecemeal/", "Outputs/", "Other/");

const WORKFLOWS = {
    full: 'multi_workflow.cwl',
    pm: 'workflow.cwl'
}

interface LooseObject {
    [Key: string]: string
}

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
    db.prepare('CREATE TABLE workflow (workflow_id INTEGER PRIMARY KEY AUTOINCREMENT, workflow_name varchar UNIQUE NOT NULL, syslink varchar UNIQUE NOT NULL)').run();
    // Add input table
    db.prepare('CREATE TABLE input (input_id INTEGER PRIMARY KEY AUTOINCREMENT, input_name varchar UNIQUE NOT NULL, syslink varchar UNQUE NOT NULL)').run();
    // Add artefact table
    db.prepare('CREATE TABLE artefact (artefact_id INTEGER PRIMARY KEY AUTOINCREMENT, artefact_name varchar NOT NULL, short_name varchar NOT NULL, syslink varchar NOT NULL, workflow_id INTEGER NOT NULL, input_id INTEGER NOT NULL, FOREIGN KEY(workflow_id) REFERENCES workflow, FOREIGN KEY(input_id) REFERENCES input)').run();
}

export function add_workflows() {
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

    // This runs a workflow with an input
    // creates a temp directory
    // runs workflow from within that directory and captures stdout to file
    // stdout file is read as object containing all workflow artefacts
    // this file can be used to integrate the results to the workflow database

    // Make sure workflow and input exist in the workflow database

    const db = new sqlite(DB_NAME, { verbose: console.log, fileMustExist: true });
    const TEMP = path.join(__dirname, "temp".concat("_", db.prepare('SELECT workflow_id FROM workflow WHERE workflow_name = ?;').all(workflow)[0].workflow_id, ".", db.prepare('SELECT input_id FROM input WHERE input_name = ?;').all(input)[0].input_id));

    return new Promise(function(resolve, reject) {

        console.log("\n - attempting to compile workflow - \n");

        // Check for entries for both workflow and input
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
        const insert_artefact = db.prepare('INSERT INTO artefact (artefact_name, short_name, syslink, workflow_id, input_id) VALUES (@artefact_name, @short_name, @syslink, @workflow_id, @input_id)');

        // Define terminal command to run workflow
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
            // Depending on workflow type (full vs piecemeal) some things change
            if (workflow == WORKFLOWS.full) {
                // import the aftefact object
                // console.log(path.resolve(__dirname, path.join(TEMP + '/','artefacts.txt')));
                let artefacts = JSON.parse(fs.readFileSync(path.resolve(__dirname, path.join(TEMP + '/','artefacts.txt'))));
                
                let filetypes = new Set<string>();
                for (const artefact in artefacts) filetypes.add(String(path.parse(artefacts[artefact].basename).ext))
                
                // create non-temp file structure to store artefacts in.
                // Record a set of these to hand over to the webp generator
                
                const directories = new Set<string>();
                
                console.log("\n - Creating filetype directory structure - \n");
                filetypes.forEach(filetype => {
                    let directroy = path.join(IMAGE_DIR_FULL, filetype.substring(1), "/");
                    directories.add(directroy);
                    if (!fs.existsSync(directroy)) {
                        console.log("directory does not exist");
                        exec('mkdir ' + directroy);
                    } else {
                        console.log("directory exists");
                    }
                })
        
                for (const artefact in artefacts) {
                    let newpath: string = path.join(IMAGE_DIR_FULL, String(path.parse(artefacts[artefact].basename).ext).substring(1));
                    exec('mv ' + artefacts[artefact].path + " " + newpath);

                    // calculate and add short_name
                    let short_name_array = artefacts[artefact].basename.split('_');
                    let short_name = short_name_array.slice(-2)[0].concat("_", short_name_array.slice(-2)[1]);

                    // Insert artefact into database
                    insert_artefact.run({
                        artefact_name: artefacts[artefact].basename,
                        short_name: short_name,
                        syslink: path.join(newpath, artefacts[artefact].basename),
                        workflow_id: db.prepare('SELECT workflow_id FROM workflow WHERE workflow_name = ?;').all(workflow)[0].workflow_id,
                        input_id: db.prepare('SELECT input_id FROM input WHERE input_name = ?;').all(input)[0].input_id
                    })
                }

                console.log("\n - Removing temp directory - \n");
                exec('rm -rf ' + TEMP);

                resolve(directories);
            } else if (workflow == WORKFLOWS.pm) {
                // PM artefacts are more detailed and include compiled results from each workflow step
                console.log(path.resolve(__dirname, path.join(TEMP + '/','artefacts.txt')));
                let artefacts = JSON.parse(fs.readFileSync(path.resolve(__dirname, path.join(TEMP + '/','artefacts.txt'))));
                let all_outputs = artefacts.all_outputs;
                let tiff = artefacts.tiff;
                // define file types for directory structure creation
                let filetypes = new Set<string>();
            
                for (const artefact in all_outputs) filetypes.add(String(path.parse(all_outputs[artefact].basename).ext));
                filetypes.add(path.parse(tiff.basename).ext);

                // create non-temp file structure to store artefacts in.
                // Record a set of these to hand over to the webp generator
                var directories: LooseObject = {}

                console.log("\n - Creating filetype directory structure - \n");
                filetypes.forEach(filetype => {
                    // add image related directories
                    if (filetype.substring(1) == 'tif') {
                        directories['tif'] = path.join(IMAGE_DIR_PM, filetype.substring(1), "/");
                    }  else if (filetype.substring(1) == 'pickle') {
                        // add picked matrix's as per step output
                        directories['pickle'] = path.join(OTHER_DIR_PM, filetype.substring(1), "/");
                    } else {
                        console.log("Unrecognised output format");
                    }
                })

                for (const directory in directories) {
                    if (!fs.existsSync(directories[directory])) {
                        console.log("directory does not exist");
                        exec('mkdir ' + directories[directory]);
                    } else {
                        console.log("directory exists");
                    }
                }

                for (const artefact in all_outputs) {
                    // console.log(all_outputs[artefact].basename)
                    // Move files to their respective directories
                    let newpath: string = directories.pickle;
                    exec('mv ' + all_outputs[artefact].path + " " + newpath);

                    // Calculate shortname
                    let short_name_array = all_outputs[artefact].basename.split('_');
                    let short_name = short_name_array.slice(-2)[0].concat("_", short_name_array.slice(-2)[1]);

                    // Insert the artefact into the database
                    insert_artefact.run({
                        artefact_name: all_outputs[artefact].basename,
                        short_name: short_name,
                        syslink: path.join(newpath, all_outputs[artefact].basename),
                        workflow_id: db.prepare('SELECT workflow_id FROM workflow WHERE workflow_name = ?;').all(workflow)[0].workflow_id,
                        input_id: db.prepare('SELECT input_id FROM input WHERE input_name = ?;').all(input)[0].input_id
                    });
                }

                const add_tiff = {
                    add: () => {
                        // Move files to their respective directories
                        let newpath: string = directories.tif;
                        exec('mv ' + tiff.path + " " + newpath);
                        
                        // calculate and add short_name
                        let short_name_array = tiff.basename.split('_');
                        let short_name = short_name_array.slice(-2)[0].concat("_", short_name_array.slice(-2)[1]);

                        // Insert artefact into database
                        insert_artefact.run({
                            artefact_name: tiff.basename,
                            short_name: short_name,
                            syslink: path.join(newpath, tiff.basename),
                            workflow_id: db.prepare('SELECT workflow_id FROM workflow WHERE workflow_name = ?;').all(workflow)[0].workflow_id,
                            input_id: db.prepare('SELECT input_id FROM input WHERE input_name = ?;').all(input)[0].input_id
                        })
                    }
                }

                add_tiff.add();
                console.log("\n - Removing temp directory - \n");
                exec('rm -rf ' + TEMP);
            } else {
                console.log("NO WORKFLOW WITH NAME " + workflow)
                resolve("ERROR");
            }

        })
    })    

}
