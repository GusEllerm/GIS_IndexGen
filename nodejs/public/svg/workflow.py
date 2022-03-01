import os

CWL_folder = os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "CWL"))
os.system("cwltool --print-dot " + str(CWL_folder) + "/Workflows/workflow.cwl | dot -Tsvg > workflow.svg")