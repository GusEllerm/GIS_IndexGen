import { initialise_currentDB, migrate_database } from "./Librarys/current_DB_lib";
import { initialise_workflowDB, add_input, add_artefact, add_workflow } from "./Librarys/workflow_DB_lib";

import { gen_full_workflow, gen_piecemeal_workflow } from "./Librarys/gen_yaml_lib";


// Generate full workflow
initialise_currentDB("L2A_T59GMK_A034632_20220207T222543/");
initialise_workflowDB()
add_workflow()
// gen_full_workflow()
add_input(gen_full_workflow())
add_artefact('multi_workflow.cwl','full_workflow.yaml').then((result) => {
    console.log(result)
})



// Generate piecemeal workflow
// initialise_currentDB("L2A_T59GMK_A034632_20220207T222543/");
// initialise_workflowDB()
// add_workflow()
// add_input(gen_piecemeal_workflow("NDVI",["B04", "B8A"], "RdYlGn"))

// init current_DB with most current dataset
// initialise_currentDB("L2A_T59GMK_A034632_20220207T222543/");
// initialise_currentDB("L2A_T59GLL_A034632_20220207T222543/");

// init workflowDB
// initialise_workflowDB()

// add a generated input to the database for use in workflow computation
// add_workflow() // just a symbolic function - is currently static as their is no way to add workflows
// add_input(gen_full_workflow())
// add_artefact('multi_workflow.cwl','full_workflow.yaml');

// generate full-workflow execution yaml
// gen_full_workflow()

// generate piecemeal execultion yaml





