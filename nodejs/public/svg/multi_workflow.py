import os

CWL_folder = os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "CWL"))
os.system("cwltool --print-dot " + str(CWL_folder) + "/Workflows/multi_workflow.cwl | dot -Tsvg > multi_workflow.svg")