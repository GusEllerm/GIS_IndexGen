# Removes databases, images and input yaml to create a clean workspace
import os
import shutil

image_directory = os.path.join(os.path.dirname(__file__), "../", "Workflow_IO/", "Full/", "Outputs/", "Images/")
image_directories = os.listdir(image_directory)
for directory in image_directories:
    path = os.path.join(image_directory, directory)
    shutil.rmtree(path)

try:
    workflow_DB = os.path.join(os.path.dirname(__file__), "../", "DB/", "workflow_DB.db")
    os.remove(workflow_DB)
except: 
    print("Workflow DB does not exist")

try:
    history_DB = os.path.join(os.path.dirname(__file__), "../", "DB/", "history_DB.db")
    os.remove(history_DB)
except: 
    print("history DB does not exist")


yaml_directory = os.path.join(os.path.dirname(__file__), "../", "Workflow_IO/", "Full/", "Inputs/", "yaml/")
yaml_files = os.listdir(yaml_directory)
for file in yaml_files:
    path = os.path.join(yaml_directory, file)
    os.remove(path)

# Removing piecemeal data
yaml_pm = os.path.join(os.path.dirname(__file__), "../", "Workflow_IO", "Piecemeal/", "Inputs/", "yaml/")
yaml_pm_files = os.listdir(yaml_pm)
for file in yaml_pm_files:
    path = os.path.join(yaml_pm, file)
    os.remove(path)

image_directory_pm = os.path.join(os.path.dirname(__file__), "../", "Workflow_IO/", "Piecemeal/", "Outputs/", "Images/")
image_directories_pm = os.listdir(image_directory_pm)
for directory in image_directories_pm:
    path = os.path.join(image_directory_pm, directory)
    shutil.rmtree(path)

other_directory = os.path.join(os.path.dirname(__file__), "../", "Workflow_IO/", "Piecemeal/", "Outputs/", "Other/")
other_directorys = os.listdir(other_directory)
for directory in other_directorys:
    path = os.path.join(other_directory, directory)
    shutil.rmtree(path)

# remove general data from workflow_IO
general_directory = os.path.join(os.path.dirname(__file__), "../", "Workflow_IO/", "General/")
general_directory_files = os.listdir(general_directory)
for file in general_directory_files:
    path = os.path.join(general_directory, file)
    os.remove(path)

history_directory = os.path.join(os.path.dirname(__file__), "../", "History/")
history_directorys = os.listdir(history_directory)
for directory in history_directorys:
    path = os.path.join(history_directory, directory)
    shutil.rmtree(path)

# tiff_directory = os.path.dirname(__file__)
# files = os.listdir(tiff_directory)
# filtered_files = [file for file in files if file.endswith(".tif")]
# for file in filtered_files:
#     path = os.path.join(tiff_directory, file)
#     os.remove(path)