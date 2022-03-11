const fs = require('fs');
const path = require('path');
const sqlite = require('better-sqlite3');
const yaml = require('write-yaml-file');

import DatabaseConstructor, { Database } from "better-sqlite3";

const DB_NAME = path.join(__dirname, "../", "DB/", "current_DB.db");
const YAML_DIR = path.join(__dirname, "../", "Workflow_IO/", "Inputs/", "yaml")
const FLOW_FULL = "full_workflow.yaml"

function format_bands(bands: any[]) {
    const formated: any[] = [{},{}];
    for (const band in bands) {
        formated[band].class = 'File';
        formated[band].path = bands[band].syslink;
    }
    return formated;
}

export function gen_piecemeal_workflow(index: string, bands: string[], color: string) {

    const db = new sqlite(DB_NAME, { verbose: console.log, readonly: true, fileMustExist: true });
    // TODO
    return "placeholder"
}

export function gen_full_workflow() {
    // Generates yaml input for full workflow execution from data found in the current_DB

    // check current_DB exists and open
    const db = new sqlite(DB_NAME, { verbose: console.log, readonly: true, fileMustExist: true });

    console.log("\n - Retrieving bands from database - \n");
    const get_two_bands = db.prepare('SELECT syslink FROM band WHERE resolution = ? AND band_short in (?, ?);');
    
    const ndvi_10m_arguments = {
        index_ndvi_10m: "NDVI",
        bands_ndvi_10m: format_bands(get_two_bands.all('R10m', 'B04', 'B08')),
        color_ndvi_10m: "RdYlGn"
    }

    const ndvi_20m_arguments = {
        index_ndvi_20m: "NDVI",
        bands_ndvi_20m: format_bands(get_two_bands.all('R20m', 'B04', 'B8A')),
        color_ndvi_20m: "RdYlGn"
    }

    const gndvi_10m_arguments = {
        index_gndvi_10m: "GNDVI",
        bands_gndvi_10m: format_bands(get_two_bands.all('R10m', 'B03', 'B08')),
        color_gndvi_10m: "RdYlGn"
    }

    const gndvi_20m_arguments = {
        index_gndvi_20m: "GNDVI",
        bands_gndvi_20m: format_bands(get_two_bands.all('R20m', 'B03', 'B8A')),
        color_gndvi_20m: "RdYlGn"
    }

    const ndre_20m_arguments = {
        index_ndre_20m: "NDRE",
        bands_ndre_20m: format_bands(get_two_bands.all('R20m', 'B05', 'B8A')),
        color_ndre_20m: "RdYlGn"
    }

    const reci_10m_arguments = {
        index_reci_10m: "RECI",
        bands_reci_10m: format_bands(get_two_bands.all('R10m', 'B04', 'B08')),
        color_reci_10m: "RdYlGn"
    }

    const reci_20m_arguments = {
        index_reci_20m: "RECI",
        bands_reci_20m: format_bands(get_two_bands.all('R20m', 'B04', 'B8A')),
        color_reci_20m: "RdYlGn"
    }
    
    const full_workflow_arguments = {
        ...ndvi_10m_arguments,
        ...ndvi_20m_arguments,
        ...gndvi_10m_arguments,
        ...gndvi_20m_arguments,
        ...ndre_20m_arguments,
        ...reci_10m_arguments,
        ...reci_20m_arguments,
    }

    yaml(path.join(YAML_DIR, FLOW_FULL), full_workflow_arguments);

    console.log("\n - Full workflow YAML generated - \n")

    return path.join(YAML_DIR, FLOW_FULL)

}

