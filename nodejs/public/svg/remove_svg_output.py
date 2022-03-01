import os

svg_directory = os.path.dirname(__file__)
files = os.listdir(svg_directory)
filtered_files = [file for file in files if file.endswith(".svg")]
for file in filtered_files:
    path = os.path.join(svg_directory, file)
    os.remove(path)