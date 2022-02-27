import os

webp_directory = os.path.dirname(__file__)
files = os.listdir(webp_directory)
filtered_files = [file for file in files if file.endswith(".webp")]
for file in filtered_files:
    path = os.path.join(webp_directory, file)
    os.remove(path)