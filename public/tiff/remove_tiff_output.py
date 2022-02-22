import os

tiff_directory = os.path.dirname(__file__)
files = os.listdir(tiff_directory)
filtered_files = [file for file in files if file.endswith(".tif")]
for file in filtered_files:
    path = os.path.join(tiff_directory, file)
    os.remove(path)