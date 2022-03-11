# Removes databases, images and input yaml to create a clean workspace
import os
import shutil

image_directory = os.path.join(os.path.dirname(__file__), "../", "Workflow_IO/", "Outputs/", "Images/")
image_directories = os.listdir(image_directory)
for directory in image_directories:
    path = os.path.join(image_directory, directory)
    shutil.rmtree(path)

db_directory = os.path.join(os.path.dirname(__file__), "../", "DB/")
db_files = os.listdir(db_directory)
for file in db_files:
    path = os.path.join(db_directory, file)
    os.remove(path)

yaml_directory = os.path.join(os.path.dirname(__file__), "../", "Workflow_IO/", "Inputs/", "yaml/")
yaml_files = os.listdir(yaml_directory)
for file in yaml_files:
    path = os.path.join(yaml_directory, file)
    os.remove(path)

# tiff_directory = os.path.dirname(__file__)
# files = os.listdir(tiff_directory)
# filtered_files = [file for file in files if file.endswith(".tif")]
# for file in filtered_files:
#     path = os.path.join(tiff_directory, file)
#     os.remove(path)