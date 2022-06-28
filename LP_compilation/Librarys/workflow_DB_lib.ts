const sharp = require('sharp')
const fs = require('fs');
const path = require('path');
const sqlite = require('better-sqlite3');
const exec = require('child_process').exec;
const xml2js = require('xml2js');
const yaml = require('js-yaml');
const archiver = require('archiver')

const WORKFLOW_DB = path.join(__dirname, "../DB/workflow_DB.db");
const CWL_DIR = path.join(__dirname, "../Data_stages/CWL/");
const IMAGE_DIR_FULL = path.join(__dirname, "../Workflow_IO/Full/Outputs/Images/");
const IMAGE_DIR_PM = path.join(__dirname, "../Workflow_IO/Piecemeal/Outputs/Images/");
const OTHER_DIR_PM = path.join(__dirname, "../Workflow_IO/Piecemeal/Outputs/Other/");
const DATA_DIR = path.join(__dirname, "../Data_stages/tardis/Data");
const WORKFLOW_GEN = path.join(__dirname, "../Workflow_IO/General/");
const SVG_DIR = path.join(__dirname, "../Workflow_IO/Piecemeal/Outputs/Other/svg/")

const WORKFLOWS = {
    full: 'multi_workflow.cwl',
    pm: 'workflow.cwl'
}

interface LooseObject {
    [Key: string]: string
}

interface Artefact {
    artefact_id: number;
    artefact_name: string;
    short_name: string;
    syslink: string;
    svg: string;
    workflow_id: number;
    input_id: number;
    type_id: number;
    data_id: number;
}

interface DB_artefact {
    item_name: string,
    type_id: number,
    syslink: string,
    svg: string|null,
    workflow_id: number,
    input_id: number
}


export function initialise_workflowDB (dataDir: string) {
    // check strcuture of data to ensure everything that should be there, is. 
    if(check_data(dataDir) == false) {
        return console.log("\n - Error in Data Structure - \n");
    }
    // Check if the database exists
    if (fs.existsSync(WORKFLOW_DB)) {
        console.log(WORKFLOW_DB + ' is initialized - migrate?');
        return {
            error: true,
            message: WORKFLOW_DB + ' already exists, did you mean to migrate'
        }
    }
    // if not already instantiated create database
    console.log('\n - initalising workflowDB - \n');
    const db = new sqlite(WORKFLOW_DB, {verbose: console.log})

    // Add workflow related tables (workflow, input, artefact, type)
    db.prepare('CREATE TABLE workflow (workflow_id INTEGER PRIMARY KEY AUTOINCREMENT, workflow_name varchar UNIQUE NOT NULL, syslink varchar UNIQUE NOT NULL, svg varchar UNIQUE)').run();
    db.prepare('CREATE TABLE input (input_id INTEGER PRIMARY KEY AUTOINCREMENT, input_name varchar UNIQUE NOT NULL, syslink varchar UNQUE NOT NULL)').run();
    db.prepare('CREATE TABLE artefact (artefact_id INTEGER PRIMARY KEY AUTOINCREMENT, artefact_name varchar NOT NULL, short_name varchar NOT NULL, syslink varchar NOT NULL, svg varchar UNIQUE, workflow_id INTEGER NOT NULL, input_id INTEGER NOT NULL, type_id INTEGER NOT NULL, data_id INTEGER NOT NULL, FOREIGN KEY(type_id) REFERENCES type, FOREIGN KEY(data_id) REFERENCES data, FOREIGN KEY(workflow_id) REFERENCES workflow, FOREIGN KEY(input_id) REFERENCES input)').run();
    db.prepare('CREATE TABLE type (type_id INTEGER PRIMARY KEY, type_name varchar UNQIUE NOT NULL)').run();
    
    // Add data related tables (data, resolution, band)
    db.prepare('CREATE TABLE data (data_id INTEGER PRIMARY KEY AUTOINCREMENT, data_name VARCHAR UNIQUE NOT NULL)').run();
    db.prepare('CREATE TABLE resolution (resolution_id INTEGER PRIMARY KEY AUTOINCREMENT, resolution varchar UNIQUE NOT NULL, data_id INTEGER NOT NULL, FOREIGN KEY(data_id) REFERENCES data)').run();
    db.prepare('CREATE TABLE band (band_id INTEGER PRIMARY KEY AUTOINCREMENT, band_name varchar UNIQUE NOT NULL, band_short varchar NOT NULL, syslink varchar UNIQUE NOT NULL, resolution_id INTEGER NOT NULL, FOREIGN KEY(resolution_id) REFERENCES resolution)').run();

    // Add web related tables
    db.prepare('Create TABLE web_interface (web_id INTEGER PRIMARY KEY AUTOINCREMENT, item_name VARCHAR NOT NULL, short_name VARCHAR NOT NULL, syslink VARCHAR NOT NULL, artefact_id INTEGER NOT NULL, type_id INTEGER NOT NULL, svg varchar UNIQUE, FOREIGN KEY(artefact_id) REFERENCES artefact, FOREIGN KEY(type_id) REFERENCES type)').run();

    // Populate tables with static / known data
    populate_type(db);
    populate_workflow(db);
    populate_data(db, dataDir);
    populate_resolution(db, dataDir);
    populate_band(db, dataDir);
}

function populate_type(db: any) {
    const insert_type = db.prepare('INSERT INTO type (type_id, type_name) VALUES (@type_id, @type_name)');
    insert_type.run({type_id: 1, type_name: 'tif'})
    insert_type.run({type_id: 2, type_name: 'webp'})
    insert_type.run({type_id: 3, type_name: 'pickle'})
    insert_type.run({type_id: 4, type_name: 'zip'})
}

export function generate_svg(artefact:string) {
    exec('cwltool --print-dot ' + CWL_DIR + 'workflow.cwl | dot -Tsvg > ' + SVG_DIR + artefact + '.svg')
    return (SVG_DIR + artefact + '.svg')
}

function populate_workflow(db: any) {
    if (!fs.existsSync(CWL_DIR + 'multi_workflow.cwl')) {
        console.log("\n - Unable to find multi_workflow.cwl - \n");
        return
    }
    if (!fs.existsSync(CWL_DIR + 'workflow.cwl')) {
        console.log('\n - Unable to find workflow.cwl - \n');
        return
    }

    // Generate SVG for each workflow
    exec('cwltool --print-dot ' + CWL_DIR + 'multi_workflow.cwl | dot -Tsvg > ' + WORKFLOW_GEN + 'multi_workflow.svg')
    exec('cwltool --print-dot ' + CWL_DIR + 'workflow.cwl | dot -Tsvg > ' + WORKFLOW_GEN + 'workflow.svg')

    const insert_workflow = db.prepare('INSERT INTO workflow (workflow_name, syslink, svg) VALUES (@workflow_name, @syslink, @svg)');
    insert_workflow.run({workflow_name: 'multi_workflow.cwl', syslink: CWL_DIR + 'multi_workflow.cwl', svg: WORKFLOW_GEN + 'multi_workflow.svg'});
    insert_workflow.run({workflow_name: 'workflow.cwl', syslink: CWL_DIR + 'workflow.cwl', svg: WORKFLOW_GEN + 'workflow.svg'});
}

function populate_data(db: any, dataDir: string) {
    db.prepare('INSERT INTO data (data_name) VALUES(@data_name)').run({ data_name: dataDir });
}

function populate_resolution(db: any, dataDir: string) {
    const insert_res = db.prepare('INSERT INTO resolution (resolution, data_id) values(@resolution, @data_id)');
    const insertResolutions = db.transaction((resolutions: any[]) => {for (const resolution of resolutions) insert_res.run(resolution);})
    const data_id = db.prepare('SELECT data_id FROM data WHERE Data_name = ?').all(dataDir)[0].data_id;
    insertResolutions([
        { resolution: "R10m", data_id: data_id },
        { resolution: "R20m", data_id: data_id },
        { resolution: "R60m", data_id: data_id },
    ]);
}

function populate_band(db:any, dataDir: string) {
    // Small helper function 
    function getBands(DataDir: string) {
        const data_path = path.join(DATA_DIR, DataDir);
        const r10m_path = path.join(data_path, 'R10m/');
        const r20m_path = path.join(data_path, 'R20m/');
        const r60m_path = path.join(data_path, 'R60m/');
        const r10m_bands = fs.readdirSync(r10m_path);
        const r20m_bands = fs.readdirSync(r20m_path);
        const r60m_bands = fs.readdirSync(r60m_path);
        return [r10m_bands, r20m_bands, r60m_bands];
    }

    const insert_band = db.prepare('INSERT INTO band (band_name, band_short, syslink, resolution_id) VALUES(@band_name, @band_short, @syslink, @resolution_id)');
    const bands: string[][] = getBands(dataDir);
    const resolution_id = db.prepare('SELECT resolution_id FROM resolution WHERE resolution = ?');
    const r10m_id = resolution_id.all('R10m')[0].resolution_id;
    const r20m_id = resolution_id.all('R20m')[0].resolution_id;
    const r60m_id = resolution_id.all('R60m')[0].resolution_id;
    // Input r10m band
    for (const band in bands[0]) {
        let short_name = bands[0][band].split("_")[2];
        let syslink = path.join(DATA_DIR, dataDir, "R10m/", bands[0][band]);
        insert_band.run({ band_name: bands[0][band], band_short: short_name, syslink: syslink, resolution_id: r10m_id });
    }
    // Input r20m band
    for (const band in bands[1]) {
        let short_name = bands[1][band].split("_")[2];
        let syslink = path.join(DATA_DIR, dataDir, "R20m/", bands[1][band]);
        insert_band.run({ band_name: bands[1][band], band_short: short_name, syslink: syslink, resolution_id: r20m_id });
    }
    // Input r60m band
    for (const band in bands[2]) {
        let short_name = bands[2][band].split("_")[2];
        let syslink = path.join(DATA_DIR, dataDir, "R60m/", bands[2][band]);
        insert_band.run({ band_name: bands[2][band], band_short: short_name, syslink: syslink, resolution_id: r60m_id });
    }
}

function check_data(DataDir: string) {
    console.log('\nReading data directory and checking compataibility');
    console.log('Data Directory: ' + DataDir);

    // Expected directory structure
    // - Data parent directory (name = unique identifier for dataset)
    // -- R10m (contains 10 res data)
    // -- R20m (contains 20 res data)
    // -- R60m (contains 60 res data)

    const data_path = path.join(DATA_DIR, DataDir);
    const r10m_path = path.join(data_path, 'R10m/');
    const r20m_path = path.join(data_path, 'R20m/');
    const r60m_path = path.join(data_path, 'R60m/');

    console.log(' -- Data parent directory exists: ' + fs.existsSync(data_path));

    if (!fs.existsSync(data_path)) {
        return false;
    }

    console.log("\nChecking r10m r20m r60m directories")
    console.log(" -- R10m exists: " + fs.existsSync(r10m_path));
    console.log(" -- R20m exists: " + fs.existsSync(r20m_path));
    console.log(" -- R60m exists: " + fs.existsSync(r60m_path));

    if (!(fs.existsSync(r10m_path) && fs.existsSync(r20m_path) && fs.existsSync(r60m_path))) {
        console.log('Error with internal data structure');
        return false;
    }

    console.log('\nList of data contained within each subdirectory');
    // Read files from 
    const r10m_files = fs.readdirSync(r10m_path);
    const r20m_files = fs.readdirSync(r20m_path);
    const r60m_files = fs.readdirSync(r60m_path);
    // log files

    console.log("R10m: ");
    r10m_files.forEach(function (value: string) { console.log(' -- ' + value)});
    console.log("\n R20m:");
    r20m_files.forEach(function (value: string) { console.log(' -- ' + value)});
    console.log("\n R60m:");
    r60m_files.forEach(function (value: string) { console.log(' -- ' + value)});
    console.log('\n');

    return true;
}

// Functions for adding items to databases

export function add_input(input_path: string) {
    const db = new sqlite(WORKFLOW_DB, { verbose: console.log, fileMustExist: true });
    const insert_input = db.prepare('INSERT INTO input (input_name, syslink) VALUES (@input_name, @syslink)');
    insert_input.run({input_name: path.basename(input_path), syslink: path.join(input_path)});
}

export function add_artefact(db: any, artefact: any, svg: string|boolean = false, workflow: string, input: string, newpath: string) {

    const insert_artefact = db.prepare('INSERT INTO artefact (artefact_name, short_name, syslink, data_id, type_id, workflow_id, input_id) VALUES (@artefact_name, @short_name, @syslink, @data_id, @type_id, @workflow_id, @input_id)');
    const insert_artefact_piecemeal = db.prepare('INSERT INTO artefact (artefact_name, short_name, syslink, svg, data_id, type_id, workflow_id, input_id) VALUES (@artefact_name, @short_name, @syslink, @svg, @data_id, @type_id, @workflow_id, @input_id)');

    // calculate and add short_name
    let short_name_array = artefact.basename.split('_');
    let short_name = short_name_array.slice(-2)[0].concat("_", short_name_array.slice(-2)[1]);

    const data_version: number = db.prepare('SELECT MAX(data_id) AS data_id FROM data').all()[0].data_id;
    const data_type: number = db.prepare('SELECT type_id FROM type WHERE type_name = ?').all(short_name.split('.')[1])[0].type_id;

    if (svg) {
        // Insert artefact into database
        insert_artefact_piecemeal.run({
            artefact_name: artefact.basename,
            short_name: short_name,
            syslink: path.join(newpath, artefact.basename),
            svg: svg,
            data_id: data_version,
            type_id: data_type,
            workflow_id: db.prepare('SELECT workflow_id FROM workflow WHERE workflow_name = ?;').all(workflow)[0].workflow_id,
            input_id: db.prepare('SELECT input_id FROM input WHERE input_name = ?;').all(input)[0].input_id
        })
    } else {
        // Insert artefact into database
        insert_artefact.run({
            artefact_name: artefact.basename,
            short_name: short_name,
            syslink: path.join(newpath, artefact.basename),
            data_id: data_version,
            type_id: data_type,
            workflow_id: db.prepare('SELECT workflow_id FROM workflow WHERE workflow_name = ?;').all(workflow)[0].workflow_id,
            input_id: db.prepare('SELECT input_id FROM input WHERE input_name = ?;').all(input)[0].input_id
            })
    }
}

export function compute_artefact(workflow: string, input: string) {

    // This runs a workflow with an input
    // creates a temp directory
    // runs workflow from within that directory and captures stdout to file
    // stdout file is read as object containing all workflow artefacts
    // this file can be used to integrate the results to the workflow database

    // Make sure workflow and input exist in the workflow database

    return new Promise(function(resolve, reject) {
        const db = new sqlite(WORKFLOW_DB, { verbose: console.log, fileMustExist: true });
        const TEMP = path.join(__dirname, "temp".concat("_", db.prepare('SELECT workflow_id FROM workflow WHERE workflow_name = ?;').all(workflow)[0].workflow_id, ".", db.prepare('SELECT input_id FROM input WHERE input_name = ?;').all(input)[0].input_id));
        console.log("\n - attempting to compile workflow - \n");
        const workflow_exists = db.prepare('SELECT EXISTS (SELECT 1 FROM workflow WHERE workflow_name = ?)');
        const input_exists = db.prepare('SELECT EXISTS (SELECT 1 FROM input WHERE input_name = ?)');
        // Check input and workflow exist within data structure
        if (!(workflow_exists.get(workflow)['EXISTS (SELECT 1 FROM workflow WHERE workflow_name = ?)'] && input_exists.get(input)['EXISTS (SELECT 1 FROM input WHERE input_name = ?)'])) {
            console.log("\n *** workflow / input is not found in " + WORKFLOW_DB + " *** \n");
            return
        }
        // Create temp directory to stage output files
        console.log("\n - Creating temp directory - \n");
        let mkdir = exec('mkdir ' + TEMP, (err: any, stdout: any, stderr: any) => {
            if (err) {
                console.log("ERROR")
                console.log(err)
                return
            }
            // console.log(stdout)
        });
        mkdir.on('exit', function() {
            console.log(" - running " + workflow + " with " + input + " input file - \n");
            // Define terminal command to run workflow with CWL-runner
            const workflow_syslink = db.prepare('SELECT syslink FROM workflow WHERE workflow_name = ?').get(workflow).syslink;
            const input_syslink = db.prepare('SELECT syslink FROM input WHERE input_name = ?').get(input).syslink;
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
                        // move to new directory
                        console.log("\n - moving files to permanent directory - \n")
                        let newpath: string = path.join(IMAGE_DIR_FULL, String(path.parse(artefacts[artefact].basename).ext).substring(1));
                        exec('mv ' + artefacts[artefact].path + " " + newpath);

                        add_artefact(db, artefacts[artefact], false, workflow, input, newpath);
                    }

                    console.log("\n - Removing temp directory - \n");
                    exec('rm -rf ' + TEMP);

                    resolve(directories);
                } else if (workflow == WORKFLOWS.pm) {
                    // make svg folder
                    

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
                            directories['svg'] = path.join(SVG_DIR);
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
                        console.log("\n - moving files to permanent directory - \n");
                        let newpath: string = directories.pickle;
                        exec('mv ' + all_outputs[artefact].path + " " + newpath);
                        add_artefact(db, all_outputs[artefact], false, workflow, input, newpath);
                    }

                    console.log("\n - moving files to permanent directory - \n");
                    let newpath: string = directories.tif;

                    exec('mv ' + tiff.path + " " + newpath);
                    add_artefact(db, tiff, generate_svg(path.parse(tiff.basename).name), workflow, input, newpath);

                    console.log("\n - Removing temp directory - \n");
                    exec('rm -rf ' + TEMP);
                    resolve(directories);
                } else {
                    console.log("NO WORKFLOW WITH NAME " + workflow)
                    resolve("ERROR");
                }

            })
        })
    })    

}

export function add_web_interface(db: any, type: string, artefactID: number|null, newname: string, syslink: string, svg: string|boolean = false) {
    const insert_web_artefact = db.prepare('INSERT INTO web_interface (item_name, short_name, syslink, artefact_id, type_id) VALUES (@item_name, @short_name, @syslink, @artefact_id, @type_id)');
    const insert_web_artefact_svg = db.prepare('INSERT INTO web_interface (item_name, short_name, syslink, artefact_id, type_id, svg) VALUES (@item_name, @short_name, @syslink, @artefact_id, @type_id, @svg)');
    const data_type: number = db.prepare('SELECT type_id FROM type WHERE type_name = ?').all(type)[0].type_id;

    let short_name_array = newname.split('_');
    let short_name = short_name_array.slice(-2)[0].concat("_", short_name_array.slice(-2)[1]);

    if (svg) {
        insert_web_artefact_svg.run({
            item_name: newname,
            short_name: short_name,
            syslink: syslink,
            artefact_id: artefactID,
            type_id: data_type,
            svg: svg
        })
    } else {
        insert_web_artefact.run({
            item_name: newname,
            short_name: short_name,
            syslink: syslink,
            artefact_id: artefactID,
            type_id: data_type
        })
    }
}

function gen_zip(artefact: Artefact, db: any) {

    const filename = path.parse(artefact.artefact_name).name + ".zip"
    console.log(filename)
    //check if zip folder exists, if not add one
    if (!fs.existsSync(OTHER_DIR_PM + "zip/")) {
        console.log("zip directory does not exist, creating...")
        exec('mkdir ' + OTHER_DIR_PM + "zip/")
    } else {
        console.log("zip directory exists")
    }

    const zip_path = OTHER_DIR_PM + "zip/" + filename
    let output = fs.createWriteStream(zip_path)
    let archive = archiver('zip', { gzip: true, zlib: { level: 0 }}) // no commpression added

    archive.pipe(output)

    const data_objects: DB_artefact[] = db.prepare('SELECT item_name, web_interface.type_id, web_interface.syslink, web_interface.svg, artefact.workflow_id, artefact.input_id FROM web_interface LEFT JOIN artefact ON web_interface.artefact_id = artefact.artefact_id WHERE workflow_id = 2 AND web_interface.type_id = 3 AND input_id = ?').all(artefact.input_id)
    let file_paths: string[] = []
    data_objects.forEach(artefact => {
        console.log(artefact)
        console.log(artefact.syslink)
        archive.file(artefact.syslink, { name: artefact.item_name })
        file_paths.push(artefact.syslink)
    });
    archive.finalize()
    add_web_interface(db, "zip", artefact.artefact_id, filename, OTHER_DIR_PM + "zip/" + filename)
    return zip_path
      
  }

export function add_svg_links(artefact: Artefact, db:any) {

    function format_directory(directory: string) {
        return path.relative(path.join(__dirname, '../../LP_compilation'), directory)
    }

    // get input yaml
    const get_input = db.prepare("SELECT syslink FROM input WHERE input_id = ?").get(artefact.input_id)
    const input_yaml = yaml.load(fs.readFileSync(get_input.syslink, 'utf8'))

    const index_name = input_yaml.index
    let bands = input_yaml.bands
    const color = input_yaml.color
    let tiff = artefact.short_name.split("_")
    let tiff_name = tiff[0] + '.tif'
    const tiff_link = format_directory(artefact.syslink)

    console.log("\n \n")

    console.log(tiff_link)

    for (const band in bands) {
        let cur_band = bands[band]
        // console.log(cur_band.path)
        // console.log(path.parse(cur_band.path).base)
        bands[band] = db.prepare('SELECT band_short FROM band WHERE band_name = ?').get(path.parse(cur_band.path).base).band_short
    }

    console.log("\n \n")

    // console.log(index_name)
    // console.log(bands)
    // console.log(color)

    // gen_zip(artefact, db).then((result) => {console.log(result)})

    let zip_path = gen_zip(artefact, db);
    let output_all_path = format_directory(zip_path);

    const svgFile = artefact.svg
    fs.readFile(svgFile, function(err: any, data: any) {
        xml2js.parseString(data, function(err:any, result:any) {
            for (const index in result.svg.g[0].g) {
                var current_object = result.svg.g[0].g[index]
                if (current_object['$'].id.includes('node')){
                    // console.log(current_object.text[0]._)
                    // console.log(current_object)
                    if (current_object.text[0]._ == "color") {
                        // color node
                        current_object.text[0]._ = color
                        let new_content = {
                            $: {
                                "href":"https://matplotlib.org/stable/tutorials/colors/colormaps.html",
                                "target": "__blank",
                                "rel": "noopener noreferrer"
                            },
                            title: current_object.title,
                            polygon: current_object.polygon,
                            text: current_object.text
                        }
                        delete current_object.title
                        delete current_object.polygon
                        delete current_object.text
                        current_object.a = new_content
                    } else if (current_object.text[0]._ == "index") {
                        current_object.text[0]._ = index_name
                        let new_content = {
                            $: {
                                "href":"https://www.geo.university/pages/vegetation-indices-a-review-of-commonly-used-spectral-indices",
                                "target": "__blank",
                                "rel": "noopener noreferrer"
                            },
                            title: current_object.title,
                            polygon: current_object.polygon,
                            text: current_object.text
                        }
                        delete current_object.title
                        delete current_object.polygon
                        delete current_object.text
                        current_object.a = new_content
                    } else if (current_object.text[0]._ == "bands") {
                        current_object.text[0]._ = bands.join("|")
                        let new_content = {
                            $: {
                                "href":"https://gisgeography.com/sentinel-2-bands-combinations/",
                                "target": "__blank",
                                "rel": "noopener noreferrer"
                            },
                            title: current_object.title,
                            polygon: current_object.polygon,
                            text: current_object.text
                        }
                        delete current_object.title
                        delete current_object.polygon
                        delete current_object.text
                        current_object.a = new_content
                    } else if (current_object.text[0]._ == "tiff") {
                        current_object.text[0]._ = tiff_name
                        let new_content = {
                            $: {
                                "href": "../../../../../".concat(tiff_link),
                                "target": "__blank",
                                "rel": "noopener noreferrer"
                            },
                            title: current_object.title,
                            polygon: current_object.polygon,
                            text: current_object.text
                        }
                        delete current_object.title
                        delete current_object.polygon
                        delete current_object.text
                        current_object.a = new_content
                    } else if (current_object.text[0]._ == "all_outputs") {
                        current_object.text[0]._ = "Sup-out"
                        let new_content = {
                            $: {
                                "href": "../../../../../".concat(output_all_path),
                                "target": "__blank",
                                "rel": "noopener noreferrer"
                            },
                            title: current_object.title,
                            polygon: current_object.polygon,
                            text: current_object.text
                        }
                        delete current_object.title
                        delete current_object.polygon
                        delete current_object.text
                        current_object.a = new_content
                    }
                }
            }
            var builder = new xml2js.Builder();
            var xml: string = builder.buildObject(result)
            fs.writeFileSync(svgFile,xml,{encoding:'utf8',flag:'w'})
        })
    })
    return (svgFile) 
    // return("DONE TEST")
}

// /Workflow_IO/Piecemeal/Outputs/Other/svg/Workflow_IO/Piecemeal/Outputs/Images/tif/T59GMK_20220207T222541_NDVI_10m.tif

export function compute_web_interface() {

 

    const db = new sqlite(WORKFLOW_DB, { verbose: console.log, fileMustExist: true });
    // Index each artefact within the artefact table into this web interface. 
    // convert tiff images into webp for presentation on website

    // Check if webp folder, if it doesnt exists create it. 
    if (!fs.existsSync(IMAGE_DIR_FULL + "webp/")) {
        console.log("\n - webp directory does not exist.. creating.. - \n");
        exec("mkdir " + IMAGE_DIR_FULL + "webp/");
    }
    if (!fs.existsSync(IMAGE_DIR_PM + "webp/")) {
        console.log("\n - webp directory does not esist.. creating.. \n");
        exec("mkdir " + IMAGE_DIR_PM + "webp/");
    }
    
    // Get all artefact entries
    const artefacts: Artefact[] = db.prepare('SELECT * FROM artefact').all();

    artefacts.forEach(artefact => {
        // If tiff, generate a webp and place within a webp directory 
        // If tiff, modify svg file to inlcude relevent links
        if (artefact.type_id == 1) {
            // Check if it is an output from the full workflow or piecemeal workflow (1 = full, 2 = piecemeal)
            if (artefact.workflow_id == 1) {
                let newname = artefact.artefact_name.split(".")[0] + ".webp";
                let newpath = IMAGE_DIR_FULL + "webp/" + newname;
                gen_webp(artefact.syslink, newpath);
                add_web_interface(db, 'webp', artefact.artefact_id, newname, newpath);
            } else if (artefact.workflow_id == 2) {
                let newname = artefact.artefact_name.split(".")[0] + ".webp";
                let newpath = IMAGE_DIR_PM + "webp/" + newname;
                gen_webp(artefact.syslink, newpath);
                add_web_interface(db, 'webp', artefact.artefact_id, newname, newpath, add_svg_links(artefact, db));
            } else return console.log("\n !!- Unknown workflow used during artefact generation -!! \n");
        } else if (artefact.type_id == 3) {
            // item is a pickle, no change needs to happen -> regester within the web table
            add_web_interface(db, 'pickle', artefact.artefact_id, artefact.artefact_name, artefact.syslink)
        }
    });
}

function gen_webp(image: string, newpath: string) {
    type Error = import('child_process').ExecException
    return new Promise((resolve, reject) => {
        sharp(image)
            .webp()
            .toFile(newpath)
            .catch(function(err: Error) { console.log(err) })
        resolve("test");
    })
}


