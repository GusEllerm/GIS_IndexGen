import rasterio
import rasterio.plot
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from rasterio.profiles import DefaultGTiffProfile
from file_handling import read_index_from_file


# /Users/eller/Projects/NDVI_Prototype/CWL/T59GMK_20220207T222541_NDVI_20m.npz

# testoutput.tif

ndvi = read_index_from_file("/Users/eller/Projects/NDVI_Prototype/CWL/T59GMK_20220207T222541_NDVI_20m.npz")[0]

plt.imshow(ndvi, cmap="RdYlGn")
plt.colorbar()
plt.title("NDVI")
plt.xlabel('Column #')
plt.ylabel('Row #')

aff = read_index_from_file("/Users/eller/Projects/NDVI_Prototype/CWL/T59GMK_20220207T222541_NDVI_20m.npz")[1]
profile = DefaultGTiffProfile()

print(profile)