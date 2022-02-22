import os

png_directory = os.path.dirname(__file__)
files = os.listdir(png_directory)
filtered_files = [file for file in files if file.endswith(".png")]
for file in filtered_files:
    path = os.path.join(png_directory, file)
    os.remove(path)