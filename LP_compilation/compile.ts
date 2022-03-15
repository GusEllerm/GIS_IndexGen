import { initialise_workflowDB, add_input, compute_artefact, compute_web_interface } from "./Librarys/workflow_DB_lib";
import { gen_full_workflow, gen_piecemeal_workflow } from "./Librarys/gen_yaml_lib";
import { resolve } from "path";
const exec = require('child_process').exec;

// assumes static workflow definitions
// assumes artefact identity understood and defined by the author - e.g. they know they are generating x artefacts with names z,t,v
// implements two common flows - full workflow execution and piecemeal workflow execution

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
    2: "L2A_T59GLL_A034632_20220207T222543/"
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
    compute_artefact(WORKFLOWS.full,'full_workflow.yaml').then((result) => {
        return compute_artefact(WORKFLOWS.pm, 'NDVI_R10m.yaml');
    })
    .then((result) => {
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
}



export function migrate(data: string) {
    // current migration is just a hard reset and init with new data
    // TODO: add the ability to retain information on previous runs 
    // TODO: be able to migrate while still serving previous data untill new data is ready
    // compute_web_interface();
    
    let child = exec('python Librarys/reset.py', (err: any, stdout: any, stderr: any) => {
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
            resolve("done");
            // compute_web_interface();
        });
    })
}




migrate(DATA_SETS[1]);




