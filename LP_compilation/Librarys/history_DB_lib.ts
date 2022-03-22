const fs = require('fs');
const path = require('path');
const sqlite = require('better-sqlite3');
const exec = require('child_process').exec;

const HISTORY_DB: string = path.join(__dirname, "../DB/history_DB.db");
const WORKFLOW_DB = path.join(__dirname, "../DB/workflow_DB.db");
const HISTORY_DIR = path.join(__dirname, "../History/")

export function init_historicalDB() {
    return new Promise(resolve => {
        // check if the history DB exists. 
        // If not, create the database
        if (fs.existsSync(HISTORY_DB)) {
            console.log('\n - ' + HISTORY_DB + ' is initialized, ready for migration...  - \n')
            resolve("done")
        } else {
            console.log('\n - ' + HISTORY_DB + ' not found. Creating DB... - \n')
            const db = new sqlite(HISTORY_DB, {verbose: console.log})
            db.prepare('CREATE TABLE history (history_id INTEGER PRIMARY KEY AUTOINCREMENT, data_used varchar NOT NULL, datetime varchar NOT NULL UNIQUE);').run();
            db.prepare('CREATE TABLE artefact (artefact_id INTEGER PRIMARY KEY AUTOINCREMENT, name varchar NOT NULL, short_name varchar NOT NULL, syslink varchar UNIUQE NOT NULL, history_id integer NOT NULL, FOREIGN KEY(history_id) REFERENCES history ON DELETE CASCADE);').run()
            resolve("done")
        }
    })
}

function create_history_dir(history_index: number) {
    return new Promise((resolve, reject) => {
        // Every entry into the history_index is reflected as its own folder in the History directory
        // There should never be a folder with the same name as the new entry
        // Names are the index of the new entry (history_index)
        // Check if there is a folder with the name history_index
        if (fs.existsSync(HISTORY_DIR + history_index)) {
            console.log('\n - ERROR: History folder already exists! - \n');
            throw "History folder alrrady exists";
        } else {
            // Create history folder
            let child = exec('mkdir ' + HISTORY_DIR + history_index);
            child.on('exit', function() {
                resolve(HISTORY_DIR + history_index);
            })
        }
    })
}

function migrate(insert_dir: string, history_index: number, artefacts: { item_name: string, syslink: string }[]) {
    // copy webps of artefacts to new location
    return new Promise((resolve, reject) => {
        let promises: any[] = [];
        artefacts.forEach(artefact => {
            // for each artefact, copy a version into the new history directory
            // Create a promise for each task
            promises.push(new Promise((resolve) => {
                let child = exec('cp ' + artefact.syslink + ' ' + insert_dir);
                child.on('exit', function() {
                    resolve({name: artefact.item_name, syslink: insert_dir + "/" + artefact.item_name})
                })
            }))
        })

        // once all the cp tasks are complete, finally resolve the outer promise
        Promise.all(promises).then((values) => {
            resolve(values)
        })
    })
}

function check_length(db: any) {
    return new Promise(resolve => {
        let promises: any[] = [];
        let num_entries = db.prepare('SELECT COUNT(*) AS count FROM history;').get()['count'];
        if (num_entries > 5) {
            // only saving 5 previous runs. Discard the oldest
            let discard = db.prepare('SELECT MIN(history_id) AS history_id FROM history').get()['history_id']
            let files_to_remove: { syslink: string }[] = db.prepare('SELECT syslink FROM artefact WHERE history_id = ?').all(discard)
            files_to_remove.forEach(file => {
                promises.push(new Promise((resolve) => {
                    let child = exec('rm ' + file.syslink)
                    child.on('exit', function() {
                        resolve(file.syslink)
                    })
                }))
            });
            Promise.all(promises).then((values) => {
                // files have been removed.
                // Remove folder
                console.log(values)
                exec('rmdir ' + path.parse(values[0]).dir)
                // remove entry in database
                db.prepare('DELETE FROM history WHERE history_id = ?').run(discard)
                resolve(values)
            })
        } else {
            resolve("Entries under 5")
        }
    })
}

export function migrate_data() {
    return new Promise(resolve => {
        // check if the workflow_db has been initalized. 
        // If not we are in the hard restart state
        if (!fs.existsSync(WORKFLOW_DB)) {
            resolve('No migration avaliable as the workflow_DB is not initalized')
        }
        // Migrate webp images to history_DB
        const history_db = new sqlite(HISTORY_DB, { verbose: console.log, fileMustExist: true });
        const workflow_db = new sqlite(WORKFLOW_DB, { verbose: console.log, fileMustExists: true });
        // First add entries to DB of current itterations webps
        // Add entry to history DB
        const utcStr = new Date().toUTCString();
        const data_used = workflow_db.prepare('SELECT data_name FROM data WHERE data_id = ?').get(1).data_name;
        const history_index: number = history_db.prepare('INSERT INTO history (data_used, datetime) VALUES (@data_used, @datetime) returning history_id').run({data_used: data_used, datetime: utcStr}).lastInsertRowid;
        const artefacts: { item_name: string, syslink: string }[] = workflow_db.prepare('SELECT item_name, syslink FROM web_interface WHERE artefact_id IN (SELECT artefact_id FROM artefact WHERE input_id != 1 AND type_id = 1) AND type_id = 2;').all()
        const add_artefact = history_db.prepare('INSERT INTO artefact (name, short_name, syslink, history_id) Values (@name, @short_name, @syslink, @history_id)')
        // remove previous history if more than five runs have been captured
        check_length(history_db)

        create_history_dir(history_index)
        .then((insert_directory: any) => {
            migrate(insert_directory, history_index, artefacts)
            .then((newItems: any) => {
                for (const index in newItems) {
                    let short_name_array = newItems[index].name.split('_');
                    let short_name = short_name_array.slice(-2)[0].concat("_", short_name_array.slice(-2)[1]);
                    
                    add_artefact.run({
                        name: newItems[index].name,
                        short_name: short_name,
                        syslink: newItems[index].syslink,
                        history_id: history_index
                    });
                }
            })
        })
        .catch((error) => {console.error(error)})
        let result: { artefact_id: number, name: string, history_id: number }[] = history_db.prepare('SELECT artefact_id, name, history_id FROM artefact WHERE history_id = ?').all(history_index)
        resolve(result)
    })
}




// db.prepare('Create TABLE web_interface (web_id INTEGER PRIMARY KEY AUTOINCREMENT, item_name VARCHAR NOT NULL, syslink VARCHAR NOT NULL, artefact_id INTEGER NOT NULL, type_id INTEGER NOT NULL, svg varchar UNIQUE, FOREIGN KEY(artefact_id) REFERENCES artefact, FOREIGN KEY(type_id) REFERENCES type)').run();
