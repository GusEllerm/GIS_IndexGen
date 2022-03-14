import { initialise_currentDB, migrate_database } from "./Librarys/current_DB_lib";
import { initialise_workflowDB, add_input, add_artefact, add_workflows } from "./Librarys/workflow_DB_lib";

import { gen_full_workflow, gen_piecemeal_workflow } from "./Librarys/gen_yaml_lib";

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

function init() {

    // // Initialize databases
    initialise_currentDB("L2A_T59GMK_A034632_20220207T222543/");
    initialise_workflowDB();

    // gen_full_workflow();

    // Add full workflow, piecemeal workflow and yaml inputs for each job
    add_workflows();
    add_input(gen_full_workflow()); // full workflow input
    // add piecemeal workflow inputs
    add_input(gen_piecemeal_workflow('NDVI', PM_RES[10], PM_INDEXS.NDVI_r10m, COLOR));
    add_input(gen_piecemeal_workflow('NDVI', PM_RES[20], PM_INDEXS.NDVI_r20m, COLOR));
    add_input(gen_piecemeal_workflow('RECI', PM_RES[10], PM_INDEXS.RECI_r10m, COLOR));
    add_input(gen_piecemeal_workflow('RECI', PM_RES[20], PM_INDEXS.RECI_r20m, COLOR));
    add_input(gen_piecemeal_workflow('GNDVI', PM_RES[10], PM_INDEXS.GNDVI_r10m, COLOR));
    add_input(gen_piecemeal_workflow('GNDVI', PM_RES[20], PM_INDEXS.GNDVI_r20m, COLOR));
    add_input(gen_piecemeal_workflow('NDRE', PM_RES[20], PM_INDEXS.NDRE_r20m, COLOR));

    // compute artefacts 
    // FULL
    add_artefact(WORKFLOWS.full,'full_workflow.yaml').then((result) => {
        console.log(result)
    });
    // PIECEMEAL
    add_artefact(WORKFLOWS.pm, 'NDVI_R10m.yaml').then((result) => {
        console.log(result)
    });
    add_artefact(WORKFLOWS.pm, 'NDVI_R20m.yaml').then((result) => {
        console.log(result)
    });
    add_artefact(WORKFLOWS.pm, 'RECI_R10m.yaml').then((result) => {
        console.log(result)
    });
    add_artefact(WORKFLOWS.pm, 'RECI_R20m.yaml').then((result) => {
        console.log(result)
    });
    add_artefact(WORKFLOWS.pm, 'GNDVI_R10m.yaml').then((result) => {
        console.log(result)
    });
    add_artefact(WORKFLOWS.pm, 'GNDVI_R20m.yaml').then((result) => {
        console.log(result)
    });
    add_artefact(WORKFLOWS.pm, 'NDRE_R20m.yaml').then((result) => {
        console.log(result)
    });

}

init();

