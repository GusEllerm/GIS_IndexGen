# Project topology

For this example CWL works as the computational engine, running the workflow and generating the tiff outputs. 
Nodejs is used to publish these results as a webpage. 
CWL_output contains workflow outputs, CWL contains the cwl code to execute workflows and the python scripts that actually do the computation. 

# Running examples

To run examples you will need to install the dependencies in requirements.txt in your local env. 
testCL.txt contains example executions of the index workflows. Use these, or your own data to produce outputs. 

Using pipenv is encouraged as it is easy to install all required dependencies from the Pipfile. 

# TODO

Currently, the webserver is not ready for deployment however the CWL is reasonably complete. 

# Example index matrix calculations

Assuming you are using pipenv, you can enter the venv using `pipenv shell`
Currently, only four indexes are implemented:
- NDVI
- RECI
- NDRE
- GNDVI

## Executing python scripts without CWL wrapper
### index_def.py script -- generates both the pickle files from the data source (band matrix's) and the index pickle file (index matrix)

`python3 CWL/Workflows/Modules/Scripts/index_def.py -i [name of index e.g. NDVI] -b [list of input bands space seperated]`

e.g. 

`python3 CWL/Workflows/Modules/Scripts/index_def.py -i NDVI -b ~/Projects/LivePaper-prototype/CWL/Workflow_inputs/Data/S2A_MSIL2A_20220207T222541_N0400_R029_T59GMK_20220208T001202.SAFE/GRANULE/L2A_T59GMK_A034632_20220207T222543/IMG_DATA/R20m/T59GMK_20220207T222541_B04_20m.jp2 ~/Projects/LivePaper-prototype/CWL/Workflow_inputs/Data/S2A_MSIL2A_20220207T222541_N0400_R029_T59GMK_20220208T001202.SAFE/GRANULE/L2A_T59GMK_A034632_20220207T222543/IMG_DATA/R20m/T59GMK_20220207T222541_B8A_20m.jp2`

### tiff_gen.py script -- generates a tiff image from an index matrix

`python3 CWL/Workflows/Modules/Scripts/tiff_gen.py -i [index matrix] -c [color map]`

e.g.

`python3 CWL/WOrkflows/Modules/Scripts/tiff_gen.py -i ~/Projects/LivePaper-prototype/T59GMK_20220207T222541_NDVI_20m.pickle -c RdYlGn`

A list of available colors can be found [here] (https://matplotlib.org/stable/tutorials/colors/colormaps.html)

## Executing workflows with CWL wrappers

Assuming you have a reference cwl-runner installed (included within dependencies) you should be able to access cwl-runner from your venv. 

### Running single Modules

The CWL is structured such that every workflow is built from two modules:
- index_def.cwl
- tiff_gen.cwl

These modules can be run independently, or as a workflow. 

To run the entire workflow:

`cwl-runner CWL/Workflows/multi_workflow.cwl CWL/Workflow_inputs/multi_workflow.yaml`

This will produce a tiff image for all four index's, as well as versions for each resolution possible (r10m, r20m)
