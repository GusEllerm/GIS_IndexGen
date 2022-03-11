const fs = require('fs');
const path = require('path');
const sqlite = require('better-sqlite3');

const DB_NAME = path.join(__dirname, "../", "DB/", "current_DB.db");
const DATA_DIR = path.join(__dirname, "../", "Data_stages/", "tardis/", "Data");

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

export function initialise_currentDB(DataDir: string) {
    if (fs.existsSync(DB_NAME)) {
        console.log(DB_NAME + ' is initialized - migrate?');
        return {
            error: true,
            message: DB_NAME + ' already exists, did you mean to migrate'
        }
    }

    console.log(DataDir)

    if (check_data(DataDir) == false) {
        return console.log("Error in data structure");
    }
    
    console.log('\nData structure OK, init database\n');
    const db = new sqlite(DB_NAME, {verbose: console.log});

    // Add data table 
    db.prepare('CREATE TABLE data (Data_name varchar UNIQUE NOT NULL PRIMARY KEY)').run();
    db.prepare('INSERT INTO data (Data_name) VALUES(@data_name)').run({ data_name: DataDir});
    // Add resolution table
    db.prepare('CREATE TABLE resolution (resolution varchar UNIQUE NOT NULL PRIMARY KEY, Data_name varchar NOT NULL, FOREIGN KEY(Data_name) REFERENCES data)').run();
    const insert_res = db.prepare('INSERT INTO resolution (resolution, Data_name) values(@resolution, @data_name)');

    const insertResolutions = db.transaction((resolutions: any[]) => {
        for (const resolution of resolutions) insert_res.run(resolution);
    });

    insertResolutions([
        { resolution: "R10m", data_name: DataDir },
        { resolution: "R20m", data_name: DataDir },
        { resolution: "R60m", data_name: DataDir },
    ]);

    db.prepare('CREATE TABLE band (band_name varchar UNIQUE NOT NULL PRIMARY KEY, band_short varchar NOT NULL, syslink varchar NOT NULL, resolution varchar NOT NULL, FOREIGN KEY(resolution) REFERENCES resolution)').run();
    const insert_band = db.prepare('INSERT INTO band (band_name, band_short, syslink, resolution) VALUES(@band_name, @band_short, @syslink, @resolution)');

    const bands: string[][] = getBands(DataDir);

    // Input r10m band
    for (const band in bands[0]) {
        let short_name = bands[0][band].split("_")[2];
        let syslink = path.join(DATA_DIR, DataDir, "R10m/", bands[0][band]);
        insert_band.run({ band_name: bands[0][band], band_short: short_name, syslink: syslink, resolution: "R10m" });
    }
    // Input r20m band
    for (const band in bands[1]) {
        let short_name = bands[1][band].split("_")[2];
        let syslink = path.join(DATA_DIR, DataDir, "R20m/", bands[1][band]);
        insert_band.run({ band_name: bands[1][band], band_short: short_name, syslink: syslink, resolution: "R20m" });
    }
    // Input r60m band
    for (const band in bands[2]) {
        let short_name = bands[2][band].split("_")[2];
        let syslink = path.join(DATA_DIR, DataDir, "R60m/", bands[2][band]);
        insert_band.run({ band_name: bands[2][band], band_short: short_name, syslink: syslink, resolution: "R60m" });
    }
}

export function migrate_database(DataDir: string) {
    // check if database exists, if not it needs to me initialised

    // TODO

    if (!fs.existsSync(DB_NAME)) {
        console.log(DB_NAME + ' not initialized')
        return {
            error: true,
            message: DB_NAME + ' does not exist for migration - init?'
        }
    }

    console.log('Migrating '+DB_NAME+' to new Dataset');

}


// Each database constitutes one set of data (eg, each iteration is instantiated as one database)

// function create_database() {}

// const Database = require('better-sqlite3');
// const db = new Database('foobar.db', {verbose: console.log});

// const create_tb = db.prepare('CREATE TABLE cats (name varchar(255), age int);')
// create_tb.run()

// const insrt = db.prepare('INSERT INTO cats (name, age) VALUES (@name, @age);');

// const insertmany = db.transaction((cats: any) => {
//     for (const cat of cats) insrt.run(cat)
// });

// insertmany([
//     { name: 'Joey', age: 2 },
//     { name: 'Sally', age: 4 },
//     { name: 'Junior', age: 1 },
// ])


// const test_stm = db.prepare('SELECT name, age FROM cats');