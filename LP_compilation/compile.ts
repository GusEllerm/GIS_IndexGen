import { initialise_workflowDB, add_input, compute_artefact, compute_web_interface } from "./Librarys/workflow_DB_lib";
import { gen_full_workflow, gen_piecemeal_workflow } from "./Librarys/gen_yaml_lib";
import { init_historicalDB, migrate_data } from "./Librarys/history_DB_lib";
const fetch = require('node-fetch');
const exec = require('child_process').exec;
const fs = require('fs');

// assumes static workflow definitions
// assumes artefact identity understood and defined by the author - e.g. they know they are generating x artefacts with names z,t,v
// implements two common flows - full workflow execution and piecemeal workflow execution

interface experement_object {
    id: number;
    title: string;
}


// pm == piecemeal
const WORKFLOWS = {
    full: 'multi_workflow.cwl',
    pm: 'workflow.cwl'
}
const PM_INDEXS = {
    NDVI_r10m: ['B04', 'B08'],
    NDVI_r20m: ['B04', 'B8A'],
    RECI_r10m: ['B04', 'B08'],
    RECI_r20m: ['B04', 'B8A'],
    GNDVI_r10m: ['B03', 'B08'],
    GNDVI_r20m: ['B03', 'B8A'],
    NDRE_r20m: ['B05', 'B8A']
}
const PM_RES = {
    10: "R10m",
    20: "R20m",
    60: "R60m"
}
const COLOR = 'RdYlGn';

const DATA_SETS = {
    1: "L2A_T59GMK_A034632_20220207T222543/",
    2: "L2A_T59GLL_A034632_20220207T222543/",
    3: "S2B_MSIL2A_20220612T222549_N0400_R029_T60HTG_20220612T234759/"
}

export function init_DB(data: string) {
    // Initialize databases
    return new Promise(resolve => {
        // initialise_currentDB(data);
        initialise_workflowDB(data);
        // populate_workflow();   
        resolve('\n - current DB and workflow DB initalized - \n')
    }) 
}

function add_inputs() {
    add_input(gen_full_workflow()); // full workflow input
    // add piecemeal workflow inputs
    add_input(gen_piecemeal_workflow('NDVI', PM_RES[10], PM_INDEXS.NDVI_r10m, COLOR));
    add_input(gen_piecemeal_workflow('NDVI', PM_RES[20], PM_INDEXS.NDVI_r20m, COLOR));
    add_input(gen_piecemeal_workflow('RECI', PM_RES[10], PM_INDEXS.RECI_r10m, COLOR));
    add_input(gen_piecemeal_workflow('RECI', PM_RES[20], PM_INDEXS.RECI_r20m, COLOR));
    add_input(gen_piecemeal_workflow('GNDVI', PM_RES[10], PM_INDEXS.GNDVI_r10m, COLOR));
    add_input(gen_piecemeal_workflow('GNDVI', PM_RES[20], PM_INDEXS.GNDVI_r20m, COLOR));
    add_input(gen_piecemeal_workflow('NDRE', PM_RES[20], PM_INDEXS.NDRE_r20m, COLOR));
}


function compute_artefacts() {
    const compute = compute_artefact;
    // could remove full_workflow execution.
    // compute_artefact(WORKFLOWS.full,'full_workflow.yaml').then((result) => {
    //     return compute_artefact(WORKFLOWS.pm, 'NDVI_R10m.yaml');
    // })
    compute_artefact(WORKFLOWS.pm, "NDVI_R10m.yaml").then((result) => {
        return compute_artefact(WORKFLOWS.pm, 'NDVI_R20m.yaml');
    })
    .then((result) => {
        return compute_artefact(WORKFLOWS.pm, 'RECI_R10m.yaml');
    })
    .then((result) => {
        return compute_artefact(WORKFLOWS.pm, 'RECI_R20m.yaml');
    })
    .then((result) => {
        return compute_artefact(WORKFLOWS.pm, 'GNDVI_R10m.yaml');
    })
    .then((result) => {
        return compute_artefact(WORKFLOWS.pm, 'GNDVI_R20m.yaml');
    })
    .then((result) => {
        return compute_artefact(WORKFLOWS.pm, 'NDRE_R20m.yaml');
    })
    .then((result) => {
        compute_web_interface()
    }) 
    .then((result) => {
        set_open()
    })
}

function set_busy(){
    fs.writeFile('LP_status.txt', "1", (err: any) => {
        if (err) {
          console.error(err)
          return
        }
        //file written successfully
      })
}

function set_open(){
    fs.writeFile('LP_status.txt', "0", (err: any) => {
        if (err) {
          console.error(err)
          return
        }
        //file written successfully
      })
}


async function get_latest_id() {

    // This is a stop measure untill MyTardis kinks are worked out - select random number for viable expermenets. Usable exps ids 9 through 26
    const possible_experements = [18, 26, 25, 14, 9, 24, 13, 14, 17, 18];
    const selected_experement = possible_experements[Math.floor(Math.random() * possible_experements.length)];

    const response = await fetch('http://130.216.218.152/api/v1/experiment/?id='.concat(selected_experement.toString()), {
        method: 'GET',
        headers: {'Authorization': 'ApiKey Gus:testkey'}
    });
    if (!response.ok) {
        console.log("Error in request to MyTardis Instance");
    } else {
        const data = await response.json();
        console.log(data)
        const dataset_id = data['objects'][0]['id'];
        const dataset_title = data['objects'][0]['persistent_id'];
        const experement: experement_object = {
            id: dataset_id,
            title: dataset_title
        }
        console.log("\n********************")
        console.log(experement)
        console.log("********************\n")

        return experement;
    }
}

async function download_dataset(experement: any) {
    let child = exec('wget --header="Authorization: ApiKey Gus:testkey" -O ingest_data.tar http://130.216.218.152/download/experiment/'.concat(experement.id.toString(), "/tar/"), (err: any, stdout: any, stderr: any) => {
        if (err) {
            console.log("ERROR");
            console.log(err);
            return;
        }
    })
    
    child.on('exit', function() {
        console.log("Finished downloading dataset");
        let child = exec('tar -xzvf ingest_data.tar -C '.concat('Data_stages/tardis/Data/'), (err: any, stdout: any, stderr: any) => {
            if (err) {
                console.log("ERROR");
                console.log(err);
                return;
            }
        })
        child.on('exit', function() {
            console.log("Data ingested and moved to data stage");
            console.log("Removing compressed data")
            let child = exec('rm ingest_data.tar');
            child.on('exit', function() {
                console.log("Removed compressed data")
                console.log('executing migration')
                migrate(experement.title)
            })
        })
    })
}


async function migrate(data: string) {
    // current migration is just a hard reset and init with new data
    // TODO: add the ability to retain information on previous runs 
    // TODO: be able to migrate while still serving previous data untill new data is ready
    // compute_web_interface();

    set_busy()
    await init_historicalDB();
    await migrate_data().then((response) => {
        console.log(response)
        let child = exec('python Librarys/softReset.py', (err: any, stdout: any, stderr: any) => {
            if (err) {
                console.log("ERROR")
                console.log(err)
                return
            }
            // console.log(stdout)
        });
        
        child.on('exit', function() {
            init_DB(data).then(result => {
                console.log(result)
                add_inputs();
                compute_artefacts();
                // compute_web_interface();
            });
        })
    })
}

export async function compile() {
    const experement: any = await get_latest_id();
    await download_dataset(experement)
}



// initialise_workflowDB("L2A_T59GMK_A034632_20220207T222543/")
// migrate(DATA_SETS[2]);
// get_latest_id();
// download_dataset();
compile();

// Currently, non-unique datasets can be downloaded and cause the process to stall. This will be addressed when MyTardis downloads are working correctly





