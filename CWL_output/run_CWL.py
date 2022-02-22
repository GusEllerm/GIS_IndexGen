import os

CWL_folder = os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "CWL"))
os.system("pipenv run cwl-runner " + str(CWL_folder) + "/Workflows/multi_workflow.cwl " + str(CWL_folder) + "/Workflow_inputs/multi_workflow.yaml")